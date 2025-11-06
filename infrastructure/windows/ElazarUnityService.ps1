# Elazar Unity Service for Windows
# Background service for cross-platform unity and OS locking

param(
    [string]$ElazarServer = "localhost:8080",
    [int]$CheckIntervalMinutes = 5
)

# Import authentication module
Import-Module "$PSScriptRoot\ElazarCrossPlatformAuth.psm1" -Force

# Global service state
$script:ServiceRunning = $true
$script:LastAuthCheck = $null
$script:LastSyncCheck = $null
$script:LastHealthCheck = $null

# Function to perform authentication validation
function Test-AuthenticationValidation {
    try {
        Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 1001 -EntryType Information -Message "Performing authentication validation check"

        $isValid = Test-ElazarAuth
        if (-not $isValid) {
            Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 1002 -EntryType Warning -Message "Authentication validation failed - re-authentication required"

            # Attempt to re-authenticate if credentials are cached
            $cachedCreds = Get-ElazarCachedCredentials
            if ($cachedCreds) {
                $reAuthResult = Connect-ElazarAuth -Username $cachedCreds.Username -Password $cachedCreds.Password -UseBiometrics
                if ($reAuthResult) {
                    Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 1003 -EntryType Information -Message "Re-authentication successful"
                } else {
                    Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 1004 -EntryType Error -Message "Re-authentication failed - account may be locked"
                    Lock-ElazarAccount
                }
            }
        } else {
            Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 1005 -EntryType Information -Message "Authentication validation passed"
        }

        $script:LastAuthCheck = Get-Date
    } catch {
        Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 1006 -EntryType Error -Message "Authentication validation error: $($_.Exception.Message)"
    }
}

# Function to perform cross-platform sync check
function Test-CrossPlatformSync {
    try {
        Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 2001 -EntryType Information -Message "Performing cross-platform sync check"

        if (-not $script:IsAuthenticated) {
            Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 2002 -EntryType Warning -Message "Not authenticated - skipping sync check"
            return
        }

        # Check sync status with server
        $headers = @{
            "Authorization" = "Bearer $($script:AuthToken)"
            "Content-Type" = "application/json"
        }

        $syncData = @{
            "deviceFingerprint" = $script:DeviceFingerprint
            "platform" = "windows"
            "lastSync" = $script:LastSyncCheck.ToString("o")
            "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
        }

        $jsonData = $syncData | ConvertTo-Json
        $response = Invoke-WebRequest -Uri "http://$ElazarServer/api/sync/status" -Method POST -Body $jsonData -Headers $headers -TimeoutSec 30

        if ($response.StatusCode -eq 200) {
            $syncResult = $response.Content | ConvertFrom-Json

            if ($syncResult.needsSync) {
                Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 2003 -EntryType Information -Message "Sync required - performing sync operation"

                # Perform sync operation
                $syncResponse = Invoke-WebRequest -Uri "http://$ElazarServer/api/sync/perform" -Method POST -Body $jsonData -Headers $headers -TimeoutSec 60

                if ($syncResponse.StatusCode -eq 200) {
                    Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 2004 -EntryType Information -Message "Cross-platform sync completed successfully"
                } else {
                    Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 2005 -EntryType Warning -Message "Sync operation failed: $($syncResponse.StatusDescription)"
                }
            } else {
                Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 2006 -EntryType Information -Message "Cross-platform sync is up to date"
            }
        } else {
            Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 2007 -EntryType Warning -Message "Failed to check sync status: $($response.StatusDescription)"
        }

        $script:LastSyncCheck = Get-Date
    } catch {
        Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 2008 -EntryType Error -Message "Cross-platform sync check error: $($_.Exception.Message)"
    }
}

# Function to perform account theft prevention check
function Test-AccountTheftPrevention {
    try {
        Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 3001 -EntryType Information -Message "Performing account theft prevention check"

        # Check for suspicious activity patterns
        $suspiciousActivity = Get-SuspiciousActivity

        if ($suspiciousActivity) {
            Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 3002 -EntryType Warning -Message "Suspicious activity detected: $($suspiciousActivity)"

            # Report suspicious activity to server
            if ($script:IsAuthenticated) {
                $headers = @{
                    "Authorization" = "Bearer $($script:AuthToken)"
                    "Content-Type" = "application/json"
                }

                $reportData = @{
                    "deviceFingerprint" = $script:DeviceFingerprint
                    "platform" = "windows"
                    "activityType" = "suspicious"
                    "details" = $suspiciousActivity
                    "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
                }

                $jsonData = $reportData | ConvertTo-Json
                $response = Invoke-WebRequest -Uri "http://$ElazarServer/api/security/report" -Method POST -Body $jsonData -Headers $headers -TimeoutSec 30

                if ($response.StatusCode -eq 200) {
                    Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 3003 -EntryType Information -Message "Suspicious activity reported to server"
                }
            }

            # Lock account if high-risk activity detected
            if ($suspiciousActivity -match "high_risk") {
                Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 3004 -EntryType Error -Message "High-risk activity detected - locking account"
                Lock-ElazarAccount
            }
        } else {
            Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 3005 -EntryType Information -Message "No suspicious activity detected"
        }
    } catch {
        Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 3006 -EntryType Error -Message "Account theft prevention check error: $($_.Exception.Message)"
    }
}

# Function to perform device theft protection check
function Test-DeviceTheftProtection {
    try {
        Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 4001 -EntryType Information -Message "Performing device theft protection check"

        # Check device location and status
        $deviceStatus = Get-DeviceStatus

        if ($deviceStatus.isStolen -or $deviceStatus.locationChanged) {
            Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 4002 -EntryType Error -Message "Device theft detected - initiating protection measures"

            # Report device theft
            if ($script:IsAuthenticated) {
                $headers = @{
                    "Authorization" = "Bearer $($script:AuthToken)"
                    "Content-Type" = "application/json"
                }

                $theftData = @{
                    "deviceFingerprint" = $script:DeviceFingerprint
                    "platform" = "windows"
                    "theftType" = if ($deviceStatus.isStolen) { "device_stolen" } else { "location_changed" }
                    "location" = $deviceStatus.location
                    "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
                }

                $jsonData = $theftData | ConvertTo-Json
                $response = Invoke-WebRequest -Uri "http://$ElazarServer/api/security/theft" -Method POST -Body $jsonData -Headers $headers -TimeoutSec 30

                if ($response.StatusCode -eq 200) {
                    Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 4003 -EntryType Information -Message "Device theft reported to server"
                }
            }

            # Lock device and account
            Lock-ElazarAccount
            Invoke-DeviceLock
        } else {
            Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 4004 -EntryType Information -Message "Device theft protection check passed"
        }
    } catch {
        Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 4005 -EntryType Error -Message "Device theft protection check error: $($_.Exception.Message)"
    }
}

# Function to perform unity health check
function Test-UnityHealth {
    try {
        Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 5001 -EntryType Information -Message "Performing unity health check"

        $healthStatus = @{
            "authentication" = $script:IsAuthenticated
            "lastAuthCheck" = $script:LastAuthCheck
            "lastSyncCheck" = $script:LastSyncCheck
            "deviceTrusted" = Test-ElazarDeviceTrust
            "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
        }

        # Report health status to server
        if ($script:IsAuthenticated) {
            $headers = @{
                "Authorization" = "Bearer $($script:AuthToken)"
                "Content-Type" = "application/json"
            }

            $jsonData = $healthStatus | ConvertTo-Json
            $response = Invoke-WebRequest -Uri "http://$ElazarServer/api/health/report" -Method POST -Body $jsonData -Headers $headers -TimeoutSec 30

            if ($response.StatusCode -eq 200) {
                Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 5002 -EntryType Information -Message "Unity health status reported successfully"
            } else {
                Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 5003 -EntryType Warning -Message "Failed to report health status: $($response.StatusDescription)"
            }
        }

        $script:LastHealthCheck = Get-Date
    } catch {
        Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 5004 -EntryType Error -Message "Unity health check error: $($_.Exception.Message)"
    }
}

# Helper functions
function Get-ElazarCachedCredentials {
    # This would retrieve cached credentials securely
    # Implementation depends on secure storage mechanism
    return $null
}

function Get-SuspiciousActivity {
    # Check for suspicious patterns like unusual login times, locations, etc.
    # This is a simplified implementation
    try {
        $recentEvents = Get-EventLog -LogName Security -Newest 100 -ErrorAction SilentlyContinue
        $suspiciousPatterns = @(
            "Account lockout",
            "Failed login attempts",
            "Suspicious process started"
        )

        foreach ($pattern in $suspiciousPatterns) {
            if ($recentEvents.Message -match $pattern) {
                return $pattern
            }
        }
    } catch {
        # Ignore errors in suspicious activity detection
    }

    return $null
}

function Get-DeviceStatus {
    # Check device location and theft status
    # This is a simplified implementation
    return @{
        "isStolen" = $false
        "locationChanged" = $false
        "location" = "Unknown"
    }
}

function Invoke-DeviceLock {
    # Lock the Windows device
    try {
        rundll32.exe user32.dll,LockWorkStation
        Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 4006 -EntryType Information -Message "Device locked due to theft protection"
    } catch {
        Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 4007 -EntryType Error -Message "Failed to lock device: $($_.Exception.Message)"
    }
}

# Main service loop
function Start-ElazarUnityService {
    Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 1 -EntryType Information -Message "Elazar Unity Service starting"

    # Initialize device fingerprint
    $script:DeviceFingerprint = Get-WindowsDeviceFingerprint

    while ($script:ServiceRunning) {
        try {
            # Perform scheduled checks
            $now = Get-Date

            # Authentication validation (every 5 minutes)
            if (-not $script:LastAuthCheck -or ($now - $script:LastAuthCheck).TotalMinutes -ge $CheckIntervalMinutes) {
                Test-AuthenticationValidation
            }

            # Cross-platform sync check (every 15 minutes)
            if (-not $script:LastSyncCheck -or ($now - $script:LastSyncCheck).TotalMinutes -ge 15) {
                Test-CrossPlatformSync
            }

            # Account theft prevention (every 10 minutes)
            if (($now - $script:LastAuthCheck).TotalMinutes -ge 10) {
                Test-AccountTheftPrevention
            }

            # Device theft protection (every 30 minutes)
            if (($now - $script:LastAuthCheck).TotalMinutes -ge 30) {
                Test-DeviceTheftProtection
            }

            # Unity health check (every 60 minutes)
            if (-not $script:LastHealthCheck -or ($now - $script:LastHealthCheck).TotalMinutes -ge 60) {
                Test-UnityHealth
            }

            # Sleep for check interval
            Start-Sleep -Seconds ($CheckIntervalMinutes * 60)

        } catch {
            Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 9999 -EntryType Error -Message "Service loop error: $($_.Exception.Message)"
            Start-Sleep -Seconds 300  # Sleep for 5 minutes on error
        }
    }

    Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 2 -EntryType Information -Message "Elazar Unity Service stopping"
}

function Stop-ElazarUnityService {
    $script:ServiceRunning = $false
    Write-EventLog -LogName "ElazarOS" -Source "ElazarUnityService" -EventId 3 -EntryType Information -Message "Elazar Unity Service stop requested"
}

# Service entry point
if ($MyInvocation.InvocationName -ne '.') {
    # Running as service
    Start-ElazarUnityService
}