#!/bin/bash
# Elazar Cross-Platform Authentication Module for Linux
# Provides unified authentication across all platforms

# Configuration
ELAZAR_SERVER="${ELAZAR_SERVER:-localhost:8080}"
AUTH_TOKEN=""
DEVICE_FINGERPRINT=""
IS_AUTHENTICATED=false

# Function to generate Linux device fingerprint
generate_device_fingerprint() {
    local fingerprint_data=""

    # Get system information
    if command -v dmidecode >/dev/null 2>&1; then
        local manufacturer=$(dmidecode -s system-manufacturer 2>/dev/null || echo "Unknown")
        local product_name=$(dmidecode -s system-product-name 2>/dev/null || echo "Unknown")
        local serial_number=$(dmidecode -s system-serial-number 2>/dev/null || echo "Unknown")
    else
        local manufacturer="Unknown"
        local product_name="Unknown"
        local serial_number="Unknown"
    fi

    # Get CPU info
    local cpu_info=$(grep -m1 "model name" /proc/cpuinfo | cut -d: -f2 | sed 's/^ *//')

    # Get OS info
    local os_info=$(lsb_release -d 2>/dev/null | cut -f2 || uname -s)

    # Get install date (approximate)
    local install_date=$(stat -c %Y / 2>/dev/null || echo "Unknown")

    # Combine fingerprint data
    fingerprint_data="${manufacturer}|${product_name}|${serial_number}|${cpu_info}|${os_info}|${install_date}"

    # Generate SHA256 hash
    if command -v sha256sum >/dev/null 2>&1; then
        DEVICE_FINGERPRINT=$(echo -n "$fingerprint_data" | sha256sum | cut -d' ' -f1)
    else
        # Fallback to md5sum if sha256sum not available
        DEVICE_FINGERPRINT=$(echo -n "$fingerprint_data" | md5sum | cut -d' ' -f1)
    fi

    echo "$DEVICE_FINGERPRINT"
}

# Function to authenticate with Elazar OS
elazar_auth_login() {
    local username="$1"
    local password="$2"
    local use_biometrics="${3:-false}"

    if [ -z "$username" ] || [ -z "$password" ]; then
        echo "Error: Username and password are required"
        return 1
    fi

    local fingerprint=$(generate_device_fingerprint)
    if [ -z "$fingerprint" ]; then
        echo "Error: Failed to generate device fingerprint"
        return 1
    fi

    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    local auth_data=$(cat <<EOF
{
    "username": "$username",
    "password": "$password",
    "deviceFingerprint": "$fingerprint",
    "platform": "linux",
    "useBiometrics": $use_biometrics,
    "timestamp": "$timestamp"
}
EOF
    )

    local response=$(curl -s -w "\n%{http_code}" -X POST \
        "http://$ELAZAR_SERVER/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "$auth_data" \
        --connect-timeout 30 \
        --max-time 30)

    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ]; then
        AUTH_TOKEN=$(echo "$response_body" | jq -r '.token' 2>/dev/null)
        IS_AUTHENTICATED=true
        echo "Successfully authenticated with Elazar OS"
        return 0
    else
        echo "Authentication failed: HTTP $http_code"
        return 1
    fi
}

# Function to validate current authentication
elazar_auth_validate() {
    if [ "$IS_AUTHENTICATED" != "true" ] || [ -z "$AUTH_TOKEN" ]; then
        return 1
    fi

    local response=$(curl -s -w "\n%{http_code}" -X GET \
        "http://$ELAZAR_SERVER/api/auth/validate" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        --connect-timeout 10 \
        --max-time 10)

    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ]; then
        return 0
    else
        IS_AUTHENTICATED=false
        AUTH_TOKEN=""
        return 1
    fi
}

# Function to sign data with device key
elazar_auth_sign() {
    local data="$1"

    if [ "$IS_AUTHENTICATED" != "true" ]; then
        echo "Error: Not authenticated. Please run elazar_auth_login first."
        return 1
    fi

    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    local sign_data=$(cat <<EOF
{
    "data": "$data",
    "deviceFingerprint": "$DEVICE_FINGERPRINT",
    "timestamp": "$timestamp"
}
EOF
    )

    local response=$(curl -s -w "\n%{http_code}" -X POST \
        "http://$ELAZAR_SERVER/api/auth/sign" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$sign_data" \
        --connect-timeout 30 \
        --max-time 30)

    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ]; then
        local signature=$(echo "$response_body" | jq -r '.signature' 2>/dev/null)
        echo "$signature"
        return 0
    else
        echo "Error: Signing failed: HTTP $http_code"
        return 1
    fi
}

# Function to verify data signature
elazar_auth_verify() {
    local data="$1"
    local signature="$2"

    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    local verify_data=$(cat <<EOF
{
    "data": "$data",
    "signature": "$signature",
    "timestamp": "$timestamp"
}
EOF
    )

    local response=$(curl -s -w "\n%{http_code}" -X POST \
        "http://$ELAZAR_SERVER/api/auth/verify" \
        -H "Content-Type: application/json" \
        -d "$verify_data" \
        --connect-timeout 30 \
        --max-time 30)

    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ]; then
        local is_valid=$(echo "$response_body" | jq -r '.isValid' 2>/dev/null)
        if [ "$is_valid" = "true" ]; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

# Function to lock account across all platforms
elazar_auth_lock() {
    if [ "$IS_AUTHENTICATED" != "true" ]; then
        echo "Error: Not authenticated. Cannot lock account."
        return 1
    fi

    local response=$(curl -s -w "\n%{http_code}" -X POST \
        "http://$ELAZAR_SERVER/api/auth/lock" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        --connect-timeout 30 \
        --max-time 30)

    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ]; then
        IS_AUTHENTICATED=false
        AUTH_TOKEN=""
        echo "Account locked across all platforms"
        return 0
    else
        echo "Error: Failed to lock account: HTTP $http_code"
        return 1
    fi
}

# Function to check device trust status
elazar_auth_trust_check() {
    local fingerprint=$(generate_device_fingerprint)
    if [ -z "$fingerprint" ]; then
        return 1
    fi

    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    local trust_data=$(cat <<EOF
{
    "deviceFingerprint": "$fingerprint",
    "platform": "linux",
    "timestamp": "$timestamp"
}
EOF
    )

    local response=$(curl -s -w "\n%{http_code}" -X POST \
        "http://$ELAZAR_SERVER/api/auth/trust" \
        -H "Content-Type: application/json" \
        -d "$trust_data" \
        --connect-timeout 30 \
        --max-time 30)

    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ]; then
        local is_trusted=$(echo "$response_body" | jq -r '.isTrusted' 2>/dev/null)
        if [ "$is_trusted" = "true" ]; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

# Function to enable biometric authentication (fingerprint reader)
elazar_auth_enable_biometrics() {
    if [ "$IS_AUTHENTICATED" != "true" ]; then
        echo "Error: Must be authenticated to enable biometrics"
        return 1
    fi

    # Check if fprintd is available (fingerprint daemon)
    if ! command -v fprintd >/dev/null 2>&1; then
        echo "Error: Fingerprint authentication not available (fprintd not installed)"
        return 1
    fi

    echo "Fingerprint authentication is available. Configuring for Elazar OS..."

    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    local bio_data=$(cat <<EOF
{
    "platform": "linux",
    "biometricType": "fingerprint",
    "deviceFingerprint": "$DEVICE_FINGERPRINT",
    "timestamp": "$timestamp"
}
EOF
    )

    local response=$(curl -s -w "\n%{http_code}" -X POST \
        "http://$ELAZAR_SERVER/api/auth/biometrics/enable" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$bio_data" \
        --connect-timeout 30 \
        --max-time 30)

    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ]; then
        echo "Biometric authentication enabled for Elazar OS"
        return 0
    else
        echo "Error: Failed to enable biometrics: HTTP $http_code"
        return 1
    fi
}

# Export functions for use in other scripts
export -f generate_device_fingerprint
export -f elazar_auth_login
export -f elazar_auth_validate
export -f elazar_auth_sign
export -f elazar_auth_verify
export -f elazar_auth_lock
export -f elazar_auth_trust_check
export -f elazar_auth_enable_biometrics