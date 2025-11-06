# Elazar OS Windows Device Tracking Service
# Monitors Windows devices and integrates with Elazar OS

param(
    [string]$ElazarServer = "localhost:8080"
)

# Function to get Windows location (if available)
function Get-WindowsLocation {
    try {
        $location = Get-NetAdapter | Where-Object { $_.Name -like "*Wi-Fi*" -or $_.Name -like "*Wireless*" } | Select-Object -First 1
        if ($location) {
            # Get Wi-Fi access point information for location approximation
            $wifiInfo = netsh wlan show interfaces | Select-String "BSSID|Signal"
            return @{
                "type" = "wifi_triangulation"
                "wifi_data" = $wifiInfo
                "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
            }
        }
    } catch {
        Write-Host "Location services not available"
    }
    return $null
}

# Function to get device information
function Get-DeviceInfo {
    $computerInfo = Get-ComputerInfo
    $networkAdapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }

    return @{
        "hostname" = $env:COMPUTERNAME
        "os" = "$($computerInfo.WindowsProductName) $($computerInfo.WindowsVersion)"
        "processor" = $computerInfo.CsProcessors[0].Name
        "memory_gb" = [math]::Round($computerInfo.CsTotalPhysicalMemory / 1GB, 2)
        "network_adapters" = $networkAdapters | Select-Object Name, MacAddress, Status
        "ip_addresses" = $networkAdapters | ForEach-Object { Get-NetIPAddress -InterfaceAlias $_.Name -AddressFamily IPv4 }
        "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
    }
}

# Function to get running processes (for activity monitoring)
function Get-RunningProcesses {
    $processes = Get-Process | Select-Object -First 50 | Select-Object Name, CPU, WorkingSet, StartTime
    return @{
        "process_count" = $processes.Count
        "top_processes" = $processes
        "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
    }
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

# Main monitoring loop
Write-Host "Starting Elazar OS Windows Device Tracking Service..."
Write-Host "Server: $ElazarServer"

$running = $true

# Register cleanup on script exit
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    $running = $false
    Write-Host "Elazar OS Windows Device Tracking Service stopped."
}

while ($running) {
    try {
        # Collect device information
        $deviceInfo = Get-DeviceInfo
        Send-ToElazarServer -Endpoint "device/info" -Data $deviceInfo

        # Collect location data
        $locationData = Get-WindowsLocation
        if ($locationData) {
            Send-ToElazarServer -Endpoint "device/location" -Data $locationData
        }

        # Collect process information
        $processData = Get-RunningProcesses
        Send-ToElazarServer -Endpoint "device/processes" -Data $processData

        # Wait before next collection
        Start-Sleep -Seconds 60

    } catch {
        Write-Host "Error in monitoring loop: $($_.Exception.Message)"
        Start-Sleep -Seconds 30
    }
}