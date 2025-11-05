# Elazar Cross-Platform Authentication Module
# Windows implementation of unified authentication system

param(
    [string]$ElazarServer = "localhost:8080"
)

# Global variables
$script:AuthToken = $null
$script:DeviceFingerprint = $null
$script:IsAuthenticated = $false

# Function to generate Windows device fingerprint
function Get-WindowsDeviceFingerprint {
    try {
        $computerInfo = Get-ComputerInfo
        $bios = Get-WmiObject Win32_BIOS
        $processor = Get-WmiObject Win32_Processor | Select-Object -First 1

        $fingerprintData = @{
            "Manufacturer" = $computerInfo.CsManufacturer
            "Model" = $computerInfo.CsModel
            "SerialNumber" = $bios.SerialNumber
            "ProcessorId" = $processor.ProcessorId
            "WindowsVersion" = $computerInfo.WindowsProductName
            "InstallDate" = $computerInfo.WindowsInstallDateFromRegistry
        }

        $fingerprintString = ($fingerprintData.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Key):$($_.Value)" }) -join "|"

        $sha256 = [System.Security.Cryptography.SHA256]::Create()
        $hashBytes = $sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($fingerprintString))
        $script:DeviceFingerprint = [BitConverter]::ToString($hashBytes).Replace("-", "").ToLower()

        return $script:DeviceFingerprint
    } catch {
        Write-Host "Failed to generate device fingerprint: $($_.Exception.Message)"
        return $null
    }
}

# Function to authenticate with Elazar OS
function Connect-ElazarAuth {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Username,

        [Parameter(Mandatory=$true)]
        [string]$Password,

        [switch]$UseBiometrics
    )

    try {
        $fingerprint = Get-WindowsDeviceFingerprint
        if (-not $fingerprint) {
            throw "Failed to generate device fingerprint"
        }

        $authData = @{
            "username" = $Username
            "password" = $Password
            "deviceFingerprint" = $fingerprint
            "platform" = "windows"
            "useBiometrics" = $UseBiometrics.IsPresent
            "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
        }

        $jsonData = $authData | ConvertTo-Json
        $response = Invoke-WebRequest -Uri "http://$ElazarServer/api/auth/login" -Method POST -Body $jsonData -ContentType "application/json" -TimeoutSec 30

        if ($response.StatusCode -eq 200) {
            $authResult = $response.Content | ConvertFrom-Json
            $script:AuthToken = $authResult.token
            $script:IsAuthenticated = $true

            Write-Host "Successfully authenticated with Elazar OS"
            return $true
        } else {
            Write-Host "Authentication failed: $($response.StatusDescription)"
            return $false
        }
    } catch {
        Write-Host "Authentication error: $($_.Exception.Message)"
        return $false
    }
}

# Function to validate current authentication
function Test-ElazarAuth {
    if (-not $script:IsAuthenticated -or -not $script:AuthToken) {
        return $false
    }

    try {
        $headers = @{
            "Authorization" = "Bearer $($script:AuthToken)"
            "Content-Type" = "application/json"
        }

        $response = Invoke-WebRequest -Uri "http://$ElazarServer/api/auth/validate" -Method GET -Headers $headers -TimeoutSec 10

        if ($response.StatusCode -eq 200) {
            return $true
        } else {
            $script:IsAuthenticated = $false
            $script:AuthToken = $null
            return $false
        }
    } catch {
        $script:IsAuthenticated = $false
        $script:AuthToken = $null
        return $false
    }
}

# Function to sign data with device key
function Sign-ElazarData {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Data
    )

    if (-not $script:IsAuthenticated) {
        Write-Host "Not authenticated. Please run Connect-ElazarAuth first."
        return $null
    }

    try {
        $signData = @{
            "data" = $Data
            "deviceFingerprint" = $script:DeviceFingerprint
            "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
        }

        $jsonData = $signData | ConvertTo-Json
        $headers = @{
            "Authorization" = "Bearer $($script:AuthToken)"
            "Content-Type" = "application/json"
        }

        $response = Invoke-WebRequest -Uri "http://$ElazarServer/api/auth/sign" -Method POST -Body $jsonData -Headers $headers -TimeoutSec 30

        if ($response.StatusCode -eq 200) {
            $signResult = $response.Content | ConvertFrom-Json
            return $signResult.signature
        } else {
            Write-Host "Signing failed: $($response.StatusDescription)"
            return $null
        }
    } catch {
        Write-Host "Signing error: $($_.Exception.Message)"
        return $null
    }
}

# Function to verify data signature
function Test-ElazarSignature {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Data,

        [Parameter(Mandatory=$true)]
        [string]$Signature
    )

    try {
        $verifyData = @{
            "data" = $Data
            "signature" = $Signature
            "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
        }

        $jsonData = $verifyData | ConvertTo-Json
        $response = Invoke-WebRequest -Uri "http://$ElazarServer/api/auth/verify" -Method POST -Body $jsonData -ContentType "application/json" -TimeoutSec 30

        if ($response.StatusCode -eq 200) {
            $verifyResult = $response.Content | ConvertFrom-Json
            return $verifyResult.isValid
        } else {
            return $false
        }
    } catch {
        Write-Host "Verification error: $($_.Exception.Message)"
        return $false
    }
}

# Function to lock account across all platforms
function Lock-ElazarAccount {
    if (-not $script:IsAuthenticated) {
        Write-Host "Not authenticated. Cannot lock account."
        return $false
    }

    try {
        $headers = @{
            "Authorization" = "Bearer $($script:AuthToken)"
            "Content-Type" = "application/json"
        }

        $response = Invoke-WebRequest -Uri "http://$ElazarServer/api/auth/lock" -Method POST -Headers $headers -TimeoutSec 30

        if ($response.StatusCode -eq 200) {
            $script:IsAuthenticated = $false
            $script:AuthToken = $null
            Write-Host "Account locked across all platforms"
            return $true
        } else {
            Write-Host "Failed to lock account: $($response.StatusDescription)"
            return $false
        }
    } catch {
        Write-Host "Lock account error: $($_.Exception.Message)"
        return $false
    }
}

# Function to check device trust status
function Test-ElazarDeviceTrust {
    try {
        $fingerprint = Get-WindowsDeviceFingerprint
        if (-not $fingerprint) {
            return $false
        }

        $trustData = @{
            "deviceFingerprint" = $fingerprint
            "platform" = "windows"
            "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
        }

        $jsonData = $trustData | ConvertTo-Json
        $response = Invoke-WebRequest -Uri "http://$ElazarServer/api/auth/trust" -Method POST -Body $jsonData -ContentType "application/json" -TimeoutSec 30

        if ($response.StatusCode -eq 200) {
            $trustResult = $response.Content | ConvertFrom-Json
            return $trustResult.isTrusted
        } else {
            return $false
        }
    } catch {
        Write-Host "Device trust check error: $($_.Exception.Message)"
        return $false
    }
}

# Function to enable biometric authentication (Windows Hello)
function Enable-ElazarBiometrics {
    try {
        # Check if Windows Hello is available
        $helloAvailable = Get-WindowsHelloStatus

        if ($helloAvailable) {
            Write-Host "Windows Hello is available. Configuring for Elazar OS..."

            # Register with Elazar OS biometric system
            if ($script:IsAuthenticated) {
                $headers = @{
                    "Authorization" = "Bearer $($script:AuthToken)"
                    "Content-Type" = "application/json"
                }

                $bioData = @{
                    "platform" = "windows"
                    "biometricType" = "windows_hello"
                    "deviceFingerprint" = $script:DeviceFingerprint
                    "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
                }

                $jsonData = $bioData | ConvertTo-Json
                $response = Invoke-WebRequest -Uri "http://$ElazarServer/api/auth/biometrics/enable" -Method POST -Body $jsonData -Headers $headers -TimeoutSec 30

                if ($response.StatusCode -eq 200) {
                    Write-Host "Biometric authentication enabled for Elazar OS"
                    return $true
                } else {
                    Write-Host "Failed to enable biometrics: $($response.StatusDescription)"
                    return $false
                }
            } else {
                Write-Host "Must be authenticated to enable biometrics"
                return $false
            }
        } else {
            Write-Host "Windows Hello is not available on this device"
            return $false
        }
    } catch {
        Write-Host "Biometric setup error: $($_.Exception.Message)"
        return $false
    }
}

# Helper function to check Windows Hello status
function Get-WindowsHelloStatus {
    try {
        $ngc = Get-WmiObject -Namespace "root\cimv2\security\MicrosoftTpm" -Class Win32_Tpm
        if ($ngc) {
            return $true
        }
        return $false
    } catch {
        return $false
    }
}

# Export functions
Export-ModuleMember -Function Connect-ElazarAuth, Test-ElazarAuth, Sign-ElazarData, Test-ElazarSignature, Lock-ElazarAccount, Test-ElazarDeviceTrust, Enable-ElazarBiometrics, Get-WindowsDeviceFingerprint