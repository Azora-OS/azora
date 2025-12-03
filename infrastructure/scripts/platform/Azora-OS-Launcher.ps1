# AZORA PROPRIETARY LICENSE
# Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

param(
    [string]$Command,
    [switch]$Install,
    [switch]$Uninstall,
    [switch]$Status,
    [switch]$Voice
)

#Requires -Version 5.1

$ErrorActionPreference = "Stop"

# Configuration
$AzoraRoot = $PSScriptRoot
$LauncherScript = Join-Path $AzoraRoot "transform-windows-to-azora.ts"
$NodeCmd = Get-Command node -ErrorAction SilentlyContinue
$TsxCmd = Get-Command tsx -ErrorAction SilentlyContinue

function Write-AzoraHeader {
    Clear-Host
    Write-Host "████████████████████████████████████████████████████████████████" -ForegroundColor Cyan
    Write-Host "█                                                              █" -ForegroundColor Cyan
    Write-Host "█                   AZORA OS POWER SHELL                       █" -ForegroundColor Cyan
    Write-Host "█                                                              █" -ForegroundColor Cyan
    Write-Host "████████████████████████████████████████████████████████████████" -ForegroundColor Cyan
    Write-Host ""
}

function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

    # Check Node.js
    if (-not $NodeCmd) {
        Write-Error "❌ Node.js is not installed. Please install Node.js 22+ from https://nodejs.org/"
        return $false
    }

    $nodeVersion = & node --version
    Write-Host "   ✓ Node.js: $nodeVersion" -ForegroundColor Green

    # Check tsx
    if (-not $TsxCmd) {
        Write-Host "   📦 Installing tsx..." -ForegroundColor Yellow
        try {
            & npm install -g tsx
            Write-Host "   ✓ tsx installed successfully" -ForegroundColor Green
        } catch {
            Write-Error "❌ Failed to install tsx: $($_.Exception.Message)"
            return $false
        }
    } else {
        Write-Host "   ✓ tsx: Available" -ForegroundColor Green
    }

    # Check required files
    $requiredFiles = @(
        "transform-windows-to-azora.ts",
        "windows-integration.ts",
        "LAUNCH_ALL_SERVICES.js"
    )

    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $AzoraRoot $file
        if (-not (Test-Path $filePath)) {
            Write-Error "❌ Required file not found: $file"
            return $false
        }
    }

    Write-Host "   ✓ All prerequisites met" -ForegroundColor Green
    return $true
}

function Install-AzoraOS {
    Write-AzoraHeader
    Write-Host "🛠️ Installing Azora OS on Windows..." -ForegroundColor Cyan
    Write-Host ""

    if (-not (Test-Prerequisites)) {
        return
    }

    try {
        # Create desktop shortcut
        Write-Host "📌 Creating desktop shortcut..." -ForegroundColor Yellow
        $desktopPath = [Environment]::GetFolderPath("Desktop")
        $shortcutPath = Join-Path $desktopPath "Azora OS.lnk"

        $WshShell = New-Object -comObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut($shortcutPath)
        $Shortcut.TargetPath = "powershell.exe"
        $Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$PSCommandPath`""
        $Shortcut.WorkingDirectory = $AzoraRoot
        $Shortcut.IconLocation = "shell32.dll,42"
        $Shortcut.Description = "Launch Azora OS - The Future of AI Computing"
        $Shortcut.Save()

        Write-Host "   ✓ Desktop shortcut created" -ForegroundColor Green

        # Add to startup (optional)
        $addToStartup = Read-Host "Add Azora OS to Windows startup? (y/n)"
        if ($addToStartup -eq 'y' -or $addToStartup -eq 'Y') {
            $startupPath = [Environment]::GetFolderPath("Startup")
            $startupShortcut = Join-Path $startupPath "Azora OS.lnk"

            Copy-Item $shortcutPath $startupShortcut -Force
            Write-Host "   ✓ Added to startup" -ForegroundColor Green
        }

        # Create system tray notification
        Write-Host "🔔 Setting up system notifications..." -ForegroundColor Yellow

        # Register with Windows Firewall (if needed)
        Write-Host "🔥 Configuring Windows Firewall..." -ForegroundColor Yellow
        $ports = @(3000, 3006, 4000, 4099, 4100, 4200, 4300, 12345)
        foreach ($port in $ports) {
            try {
                netsh advfirewall firewall add rule name="Azora OS Port $port" dir=in action=allow protocol=TCP localport=$port
            } catch {
                Write-Host "   ⚠️ Could not add firewall rule for port $port" -ForegroundColor Yellow
            }
        }

        Write-Host "" -ForegroundColor Green
        Write-Host "🎉 Azora OS installed successfully!" -ForegroundColor Green
        Write-Host "" -ForegroundColor Cyan
        Write-Host "Next steps:"
        Write-Host "1. Run Azora OS from desktop shortcut"
        Write-Host "2. Say 'Hey Elara' to activate voice commands"
        Write-Host "3. Enjoy the future of AI computing!"
        Write-Host ""

    } catch {
        Write-Error "❌ Installation failed: $($_.Exception.Message)"
    }
}

function Uninstall-AzoraOS {
    Write-AzoraHeader
    Write-Host "🗑️ Uninstalling Azora OS..." -ForegroundColor Yellow
    Write-Host ""

    try {
        # Remove desktop shortcut
        $desktopPath = [Environment]::GetFolderPath("Desktop")
        $shortcutPath = Join-Path $desktopPath "Azora OS.lnk"
        if (Test-Path $shortcutPath) {
            Remove-Item $shortcutPath -Force
            Write-Host "✓ Desktop shortcut removed" -ForegroundColor Green
        }

        # Remove startup shortcut
        $startupPath = [Environment]::GetFolderPath("Startup")
        $startupShortcut = Join-Path $startupPath "Azora OS.lnk"
        if (Test-Path $startupShortcut) {
            Remove-Item $startupShortcut -Force
            Write-Host "✓ Startup shortcut removed" -ForegroundColor Green
        }

        # Remove firewall rules
        Write-Host "🔥 Removing firewall rules..." -ForegroundColor Yellow
        $ports = @(3000, 3006, 4000, 4099, 4100, 4200, 4300, 12345)
        foreach ($port in $ports) {
            try {
                netsh advfirewall firewall delete rule name="Azora OS Port $port"
            } catch {
                # Ignore errors if rule doesn't exist
            }
        }

        Write-Host "" -ForegroundColor Green
        Write-Host "✅ Azora OS uninstalled successfully!" -ForegroundColor Green
        Write-Host "Note: Azora OS files remain in $AzoraRoot" -ForegroundColor Yellow

    } catch {
        Write-Error "❌ Uninstallation failed: $($_.Exception.Message)"
    }
}

function Get-AzoraStatus {
    Write-AzoraHeader
    Write-Host "📊 Azora OS Status" -ForegroundColor Cyan
    Write-Host ""

    # Check if processes are running
    $azoraProcesses = Get-Process | Where-Object {
        $_.ProcessName -like "*node*" -or
        $_.ProcessName -like "*azora*" -or
        $_.ProcessName -like "*elara*"
    }

    if ($azoraProcesses) {
        Write-Host "🟢 Azora OS Processes Running:" -ForegroundColor Green
        $azoraProcesses | ForEach-Object {
            Write-Host "   • $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor White
        }
    } else {
        Write-Host "🔴 No Azora OS processes running" -ForegroundColor Red
    }

    # Check services
    Write-Host "" -ForegroundColor Cyan
    Write-Host "🔍 Checking Azora Services:" -ForegroundColor Yellow

    $servicesToCheck = @(
        @{Name = "Azora Nexus"; Port = 3006},
        @{Name = "Azora Aegis"; Port = 4000},
        @{Name = "Azora Covenant"; Port = 4099},
        @{Name = "Azora Mint"; Port = 4300},
        @{Name = "Azora Sapiens"; Port = 4200}
    )

    foreach ($service in $servicesToCheck) {
        try {
            $tcpClient = New-Object System.Net.Sockets.TcpClient
            $tcpClient.Connect("localhost", $service.Port)
            $tcpClient.Close()
            Write-Host "   ✓ $($service.Name) (Port $($service.Port))" -ForegroundColor Green
        } catch {
            Write-Host "   ✗ $($service.Name) (Port $($service.Port))" -ForegroundColor Red
        }
    }

    # System resources
    Write-Host "" -ForegroundColor Cyan
    Write-Host "💻 System Resources:" -ForegroundColor Yellow
    $cpu = Get-WmiObject Win32_Processor | Select-Object -First 1
    $memory = Get-WmiObject Win32_OperatingSystem
    $totalMemory = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 1)
    $freeMemory = [math]::Round($memory.FreePhysicalMemory / 1MB, 1)

    Write-Host "   CPU: $($cpu.Name)" -ForegroundColor White
    Write-Host "   Memory: $freeMemory GB free / $totalMemory GB total" -ForegroundColor White
    Write-Host "   OS: $(Get-WmiObject Win32_OperatingSystem).Caption" -ForegroundColor White
}

function Start-AzoraOS {
    Write-AzoraHeader

    if (-not (Test-Prerequisites)) {
        return
    }

    Write-Host "🚀 Launching Azora OS..." -ForegroundColor Cyan
    Write-Host ""

    try {
        # Change to Azora directory
        Set-Location $AzoraRoot

        # Launch the transformation
        if ($Voice) {
            Write-Host "🎤 Starting Azora OS with voice interface..." -ForegroundColor Yellow
            & tsx $LauncherScript "activate voice"
        } else {
            Write-Host "🌟 Starting full Azora OS transformation..." -ForegroundColor Yellow
            & tsx $LauncherScript
        }

    } catch {
        Write-Error "❌ Failed to launch Azora OS: $($_.Exception.Message)"
    }
}

function Invoke-VoiceCommand {
    param([string]$VoiceCommand)

    if (-not (Test-Prerequisites)) {
        return
    }

    Write-Host "🎯 Processing voice command: '$VoiceCommand'" -ForegroundColor Cyan

    try {
        Set-Location $AzoraRoot
        & tsx $LauncherScript $VoiceCommand.Split(" ")
    } catch {
        Write-Error "❌ Voice command failed: $($_.Exception.Message)"
    }
}

# Main execution logic
try {
    if ($Install) {
        Install-AzoraOS
    } elseif ($Uninstall) {
        Uninstall-AzoraOS
    } elseif ($Status) {
        Get-AzoraStatus
    } elseif ($Command) {
        Invoke-VoiceCommand -VoiceCommand $Command
    } else {
        Start-AzoraOS
    }
} catch {
    Write-Error "💥 Fatal error: $($_.Exception.Message)"
    exit 1
}
