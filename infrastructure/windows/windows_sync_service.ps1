# Elazar OS Windows Synchronization Service
# Handles data synchronization between Windows and Elazar OS

param(
    [string]$ElazarServer = "localhost:8080",
    [string]$SyncIntervalSeconds = 300  # 5 minutes
)

# Function to get Windows user data for sync
function Get-WindowsUserData {
    $userProfile = $env:USERPROFILE

    # Get recent files
    $recentFiles = Get-ChildItem "$userProfile\AppData\Roaming\Microsoft\Windows\Recent" -File -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -gt (Get-Date).AddHours(-24) } |
        Select-Object Name, LastWriteTime, Length

    # Get browser history (Chrome example)
    $chromeHistory = $null
    $chromePath = "$userProfile\AppData\Local\Google\Chrome\User Data\Default\History"
    if (Test-Path $chromePath) {
        # Note: Reading Chrome history requires SQLite, simplified version
        $chromeHistory = @{
            "last_modified" = (Get-Item $chromePath).LastWriteTime
            "size_mb" = [math]::Round((Get-Item $chromePath).Length / 1MB, 2)
        }
    }

    # Get system event logs
    $systemEvents = Get-EventLog -LogName System -Newest 10 -ErrorAction SilentlyContinue |
        Select-Object TimeGenerated, Source, Message

    return @{
        "recent_files" = $recentFiles
        "browser_history" = $chromeHistory
        "system_events" = $systemEvents
        "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
    }
}

# Function to sync Windows settings
function Get-WindowsSettings {
    return @{
        "timezone" = (Get-TimeZone).Id
        "locale" = Get-WinSystemLocale
        "power_plan" = (Get-WmiObject -Class Win32_PowerPlan -Namespace root\cimv2\power -Filter "IsActive=True").ElementName
        "network_connections" = Get-NetConnectionProfile | Select-Object Name, NetworkCategory, IPv4Connectivity
        "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
    }
}

# Function to perform bidirectional sync
function Sync-WithElazar {
    param(
        [string]$Direction  # "upload" or "download"
    )

    if ($Direction -eq "upload") {
        # Upload Windows data to Elazar OS
        Write-Host "Uploading Windows data to Elazar OS..."

        $userData = Get-WindowsUserData
        Send-ToElazarServer -Endpoint "sync/windows/upload" -Data $userData

        $settings = Get-WindowsSettings
        Send-ToElazarServer -Endpoint "sync/windows/settings" -Data $settings

    } elseif ($Direction -eq "download") {
        # Download data from Elazar OS to Windows
        Write-Host "Downloading data from Elazar OS..."

        try {
            $response = Invoke-WebRequest -Uri "http://$ElazarServer/api/sync/windows/download" -Method GET -TimeoutSec 30
            $downloadData = $response.Content | ConvertFrom-Json

            # Process downloaded data (apply settings, update files, etc.)
            if ($downloadData.settings) {
                Apply-ElazarSettings -Settings $downloadData.settings
            }

            Write-Host "Downloaded data processed successfully"

        } catch {
            Write-Host "Failed to download data: $($_.Exception.Message)"
        }
    }
}

# Function to apply settings from Elazar OS
function Apply-ElazarSettings {
    param([object]$Settings)

    # Apply timezone if different
    if ($Settings.timezone -and $Settings.timezone -ne (Get-TimeZone).Id) {
        try {
            Set-TimeZone -Id $Settings.timezone
            Write-Host "Timezone updated to: $($Settings.timezone)"
        } catch {
            Write-Host "Failed to update timezone: $($_.Exception.Message)"
        }
    }

    # Apply other settings as needed
    # Note: This is a simplified example
}

# Function to send data to Elazar OS server
function Send-ToElazarServer {
    param(
        [string]$Endpoint,
        [object]$Data
    )

    try {
        $jsonData = $Data | ConvertTo-Json -Depth 10
        $response = Invoke-WebRequest -Uri "http://$ElazarServer/api/$Endpoint" -Method POST -Body $jsonData -ContentType "application/json" -TimeoutSec 30
        Write-Host "Data sent to $Endpoint - Status: $($response.StatusCode)"
    } catch {
        Write-Host "Failed to send data to $Endpoint : $($_.Exception.Message)"
    }
}

# Function to check server connectivity
function Test-ElazarConnectivity {
    try {
        $response = Invoke-WebRequest -Uri "http://$ElazarServer/api/health" -Method GET -TimeoutSec 10
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Main sync loop
Write-Host "Starting Elazar OS Windows Synchronization Service..."
Write-Host "Server: $ElazarServer"
Write-Host "Sync Interval: $SyncIntervalSeconds seconds"

$running = $true

# Register cleanup on script exit
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    $running = $false
    Write-Host "Elazar OS Windows Synchronization Service stopped."
}

while ($running) {
    try {
        # Check connectivity
        if (Test-ElazarConnectivity) {
            Write-Host "Elazar OS server is reachable. Starting sync..."

            # Perform bidirectional sync
            Sync-WithElazar -Direction "upload"
            Start-Sleep -Seconds 2
            Sync-WithElazar -Direction "download"

            Write-Host "Sync completed successfully"
        } else {
            Write-Host "Elazar OS server is not reachable. Skipping sync."
        }

        # Wait for next sync cycle
        Start-Sleep -Seconds $SyncIntervalSeconds

    } catch {
        Write-Host "Error in sync loop: $($_.Exception.Message)"
        Start-Sleep -Seconds 30
    }
}