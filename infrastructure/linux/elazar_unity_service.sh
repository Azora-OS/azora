#!/bin/bash
# Elazar Unity Service for Linux
# Background service for cross-platform unity and OS locking

# Configuration
ELAZAR_SERVER="${ELAZAR_SERVER:-localhost:8080}"
CHECK_INTERVAL_MINUTES="${CHECK_INTERVAL_MINUTES:-5}"
SERVICE_RUNNING=true

# Source authentication module
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/elazar_auth.sh"

# Global service state
LAST_AUTH_CHECK=""
LAST_SYNC_CHECK=""
LAST_HEALTH_CHECK=""

# Logging function
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    echo "[$timestamp] [$level] $message" >> /var/log/elazar-unity-service.log

    # Also log to systemd journal if available
    if command -v logger >/dev/null 2>&1; then
        logger -t elazar-unity-service -p "user.$level" "$message"
    fi
}

# Function to perform authentication validation
authentication_validation_check() {
    log_message "info" "Performing authentication validation check"

    if elazar_auth_validate; then
        log_message "info" "Authentication validation passed"
    else
        log_message "warning" "Authentication validation failed - re-authentication required"

        # Attempt to re-authenticate if credentials are cached
        if [ -f "$HOME/.elazar/credentials.enc" ]; then
            # Note: In production, this should use proper secure credential storage
            log_message "info" "Attempting re-authentication with cached credentials"

            # This is a placeholder - actual implementation would decrypt and use cached credentials
            if elazar_auth_login "cached_user" "cached_pass"; then
                log_message "info" "Re-authentication successful"
            else
                log_message "error" "Re-authentication failed - account may be locked"
                elazar_auth_lock
            fi
        fi
    fi

    LAST_AUTH_CHECK=$(date +%s)
}

# Function to perform cross-platform sync check
cross_platform_sync_check() {
    log_message "info" "Performing cross-platform sync check"

    if [ "$IS_AUTHENTICATED" != "true" ]; then
        log_message "warning" "Not authenticated - skipping sync check"
        return
    fi

    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local last_sync_timestamp=""
    if [ -n "$LAST_SYNC_CHECK" ]; then
        last_sync_timestamp=$(date -u -d "@$LAST_SYNC_CHECK" +"%Y-%m-%dT%H:%M:%SZ")
    fi

    local sync_data=$(cat <<EOF
{
    "deviceFingerprint": "$DEVICE_FINGERPRINT",
    "platform": "linux",
    "lastSync": "$last_sync_timestamp",
    "timestamp": "$timestamp"
}
EOF
    )

    local response=$(curl -s -w "\n%{http_code}" -X POST \
        "http://$ELAZAR_SERVER/api/sync/status" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$sync_data" \
        --connect-timeout 30 \
        --max-time 30)

    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ]; then
        local needs_sync=$(echo "$response_body" | jq -r '.needsSync' 2>/dev/null)

        if [ "$needs_sync" = "true" ]; then
            log_message "info" "Sync required - performing sync operation"

            local sync_response=$(curl -s -w "\n%{http_code}" -X POST \
                "http://$ELAZAR_SERVER/api/sync/perform" \
                -H "Authorization: Bearer $AUTH_TOKEN" \
                -H "Content-Type: application/json" \
                -d "$sync_data" \
                --connect-timeout 60 \
                --max-time 60)

            local sync_http_code=$(echo "$sync_response" | tail -n1)

            if [ "$sync_http_code" = "200" ]; then
                log_message "info" "Cross-platform sync completed successfully"
            else
                log_message "warning" "Sync operation failed: HTTP $sync_http_code"
            fi
        else
            log_message "info" "Cross-platform sync is up to date"
        fi
    else
        log_message "warning" "Failed to check sync status: HTTP $http_code"
    fi

    LAST_SYNC_CHECK=$(date +%s)
}

# Function to perform account theft prevention check
account_theft_prevention_check() {
    log_message "info" "Performing account theft prevention check"

    local suspicious_activity=$(detect_suspicious_activity)

    if [ -n "$suspicious_activity" ]; then
        log_message "warning" "Suspicious activity detected: $suspicious_activity"

        # Report suspicious activity to server
        if [ "$IS_AUTHENTICATED" = "true" ]; then
            local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

            local report_data=$(cat <<EOF
{
    "deviceFingerprint": "$DEVICE_FINGERPRINT",
    "platform": "linux",
    "activityType": "suspicious",
    "details": "$suspicious_activity",
    "timestamp": "$timestamp"
}
EOF
            )

            local response=$(curl -s -w "\n%{http_code}" -X POST \
                "http://$ELAZAR_SERVER/api/security/report" \
                -H "Authorization: Bearer $AUTH_TOKEN" \
                -H "Content-Type: application/json" \
                -d "$report_data" \
                --connect-timeout 30 \
                --max-time 30)

            local http_code=$(echo "$response" | tail -n1)

            if [ "$http_code" = "200" ]; then
                log_message "info" "Suspicious activity reported to server"
            fi
        fi

        # Lock account if high-risk activity detected
        if [[ "$suspicious_activity" == *"high_risk"* ]]; then
            log_message "error" "High-risk activity detected - locking account"
            elazar_auth_lock
        fi
    else
        log_message "info" "No suspicious activity detected"
    fi
}

# Function to perform device theft protection check
device_theft_protection_check() {
    log_message "info" "Performing device theft protection check"

    local device_status=$(get_device_status)
    local is_stolen=$(echo "$device_status" | jq -r '.isStolen' 2>/dev/null)
    local location_changed=$(echo "$device_status" | jq -r '.locationChanged' 2>/dev/null)
    local location=$(echo "$device_status" | jq -r '.location' 2>/dev/null)

    if [ "$is_stolen" = "true" ] || [ "$location_changed" = "true" ]; then
        log_message "error" "Device theft detected - initiating protection measures"

        # Report device theft
        if [ "$IS_AUTHENTICATED" = "true" ]; then
            local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
            local theft_type="location_changed"
            if [ "$is_stolen" = "true" ]; then
                theft_type="device_stolen"
            fi

            local theft_data=$(cat <<EOF
{
    "deviceFingerprint": "$DEVICE_FINGERPRINT",
    "platform": "linux",
    "theftType": "$theft_type",
    "location": "$location",
    "timestamp": "$timestamp"
}
EOF
            )

            local response=$(curl -s -w "\n%{http_code}" -X POST \
                "http://$ELAZAR_SERVER/api/security/theft" \
                -H "Authorization: Bearer $AUTH_TOKEN" \
                -H "Content-Type: application/json" \
                -d "$theft_data" \
                --connect-timeout 30 \
                --max-time 30)

            local http_code=$(echo "$response" | tail -n1)

            if [ "$http_code" = "200" ]; then
                log_message "info" "Device theft reported to server"
            fi
        fi

        # Lock device and account
        elazar_auth_lock
        lock_device
    else
        log_message "info" "Device theft protection check passed"
    fi
}

# Function to perform unity health check
unity_health_check() {
    log_message "info" "Performing unity health check"

    local last_auth_check_timestamp=""
    local last_sync_check_timestamp=""

    if [ -n "$LAST_AUTH_CHECK" ]; then
        last_auth_check_timestamp=$(date -u -d "@$LAST_AUTH_CHECK" +"%Y-%m-%dT%H:%M:%SZ")
    fi

    if [ -n "$LAST_SYNC_CHECK" ]; then
        last_sync_check_timestamp=$(date -u -d "@$LAST_SYNC_CHECK" +"%Y-%m-%dT%H:%M:%SZ")
    fi

    local device_trusted="false"
    if elazar_auth_trust_check; then
        device_trusted="true"
    fi

    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    local health_status=$(cat <<EOF
{
    "authentication": $IS_AUTHENTICATED,
    "lastAuthCheck": "$last_auth_check_timestamp",
    "lastSyncCheck": "$last_sync_check_timestamp",
    "deviceTrusted": $device_trusted,
    "timestamp": "$timestamp"
}
EOF
    )

    # Report health status to server
    if [ "$IS_AUTHENTICATED" = "true" ]; then
        local response=$(curl -s -w "\n%{http_code}" -X POST \
            "http://$ELAZAR_SERVER/api/health/report" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$health_status" \
            --connect-timeout 30 \
            --max-time 30)

        local http_code=$(echo "$response" | tail -n1)

        if [ "$http_code" = "200" ]; then
            log_message "info" "Unity health status reported successfully"
        else
            log_message "warning" "Failed to report health status: HTTP $http_code"
        fi
    fi

    LAST_HEALTH_CHECK=$(date +%s)
}

# Helper functions
detect_suspicious_activity() {
    # Check for suspicious patterns like unusual login attempts, etc.
    # This is a simplified implementation

    # Check auth.log for failed login attempts
    if [ -f /var/log/auth.log ]; then
        local recent_failures=$(grep -c "Failed password" /var/log/auth.log 2>/dev/null || echo "0")
        if [ "$recent_failures" -gt 5 ]; then
            echo "high_risk: Multiple failed login attempts ($recent_failures)"
            return
        elif [ "$recent_failures" -gt 2 ]; then
            echo "warning: Failed login attempts ($recent_failures)"
            return
        fi
    fi

    # Check for suspicious processes
    local suspicious_processes=$(ps aux | grep -E "(nmap|hydra|john|hashcat|aircrack)" | grep -v grep | wc -l)
    if [ "$suspicious_processes" -gt 0 ]; then
        echo "high_risk: Suspicious security testing processes detected"
        return
    fi

    echo ""
}

get_device_status() {
    # Check device location and theft status
    # This is a simplified implementation
    echo '{"isStolen": false, "locationChanged": false, "location": "Unknown"}'
}

lock_device() {
    # Lock the Linux device
    log_message "info" "Locking device due to theft protection"

    # Try different locking mechanisms
    if command -v gnome-screensaver-command >/dev/null 2>&1; then
        gnome-screensaver-command -l
    elif command -v dm-tool >/dev/null 2>&1; then
        dm-tool lock
    elif command -v loginctl >/dev/null 2>&1; then
        loginctl lock-session
    else
        log_message "warning" "No suitable screen locking command found"
    fi
}

# Main service loop
main() {
    log_message "info" "Elazar Unity Service starting"

    # Initialize device fingerprint
    generate_device_fingerprint

    # Trap SIGTERM for graceful shutdown
    trap 'SERVICE_RUNNING=false; log_message "info" "Elazar Unity Service stopping"' TERM INT

    while [ "$SERVICE_RUNNING" = "true" ]; do
        local current_time=$(date +%s)

        # Authentication validation (every 5 minutes)
        if [ -z "$LAST_AUTH_CHECK" ] || [ $((current_time - LAST_AUTH_CHECK)) -ge $((CHECK_INTERVAL_MINUTES * 60)) ]; then
            authentication_validation_check
        fi

        # Cross-platform sync check (every 15 minutes)
        if [ -z "$LAST_SYNC_CHECK" ] || [ $((current_time - LAST_SYNC_CHECK)) -ge 900 ]; then
            cross_platform_sync_check
        fi

        # Account theft prevention (every 10 minutes)
        if [ -z "$LAST_AUTH_CHECK" ] || [ $((current_time - LAST_AUTH_CHECK)) -ge 600 ]; then
            account_theft_prevention_check
        fi

        # Device theft protection (every 30 minutes)
        if [ -z "$LAST_AUTH_CHECK" ] || [ $((current_time - LAST_AUTH_CHECK)) -ge 1800 ]; then
            device_theft_protection_check
        fi

        # Unity health check (every 60 minutes)
        if [ -z "$LAST_HEALTH_CHECK" ] || [ $((current_time - LAST_HEALTH_CHECK)) -ge 3600 ]; then
            unity_health_check
        fi

        # Sleep for check interval
        sleep $((CHECK_INTERVAL_MINUTES * 60))
    done

    log_message "info" "Elazar Unity Service stopped"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main
fi