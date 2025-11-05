# AZORA PROPRIETARY LICENSE
# Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

# ELARA VOICE ASSISTANT FOR WINDOWS
# Advanced AI voice interface with natural language processing

param(
    [switch]$Continuous,
    [string]$WakeWord = "hey elara",
    [int]$SilenceTimeout = 3000,
    [string]$AzoraRoot = $PSScriptRoot
)

#Requires -Version 5.1

$ErrorActionPreference = "Stop"

# Add Windows Forms and Speech assemblies
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Speech

# Global variables
$speechRecognizer = $null
$speechSynthesizer = $null
$isListening = $false
$wakeWordDetected = $false
$lastActivity = Get-Date

function Initialize-VoiceEngine {
    Write-Host "🎤 Initializing Elara Voice Engine..." -ForegroundColor Cyan

    try {
        # Initialize speech recognition
        $speechRecognizer = New-Object System.Speech.Recognition.SpeechRecognizer

        # Initialize speech synthesis
        $speechSynthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer

        # Configure synthesizer voice
        $voices = $speechSynthesizer.GetInstalledVoices()
        if ($voices.Count -gt 0) {
            # Try to find a female voice for Elara
            $elaraVoice = $voices | Where-Object { $_.VoiceInfo.Name -like "*Zira*" -or $_.VoiceInfo.Name -like "*Hazel*" } | Select-Object -First 1
            if ($elaraVoice) {
                $speechSynthesizer.SelectVoice($elaraVoice.VoiceInfo.Name)
            }
        }

        # Set speech rate and volume
        $speechSynthesizer.Rate = 0  # Normal speed
        $speechSynthesizer.Volume = 80  # 80% volume

        Write-Host "   ✓ Speech recognition initialized" -ForegroundColor Green
        Write-Host "   ✓ Speech synthesis initialized" -ForegroundColor Green
        Write-Host "   ✓ Voice: $($speechSynthesizer.Voice.Name)" -ForegroundColor Green

        return $true
    } catch {
        Write-Error "❌ Failed to initialize voice engine: $($_.Exception.Message)"
        return $false
    }
}

function Speak-Text {
    param([string]$Text)

    if (-not $speechSynthesizer) {
        Write-Host "🗣️ $Text" -ForegroundColor Magenta
        return
    }

    try {
        Write-Host "🗣️ $Text" -ForegroundColor Magenta
        $speechSynthesizer.Speak($Text)
    } catch {
        Write-Host "🗣️ $Text" -ForegroundColor Magenta
        Write-Warning "Speech synthesis failed: $($_.Exception.Message)"
    }
}

function Start-WakeWordDetection {
    Write-Host "👂 Starting wake word detection..." -ForegroundColor Yellow
    Write-Host "Say '$WakeWord' to activate Elara" -ForegroundColor White
    Write-Host ""

    $isListening = $true
    $wakeWordDetected = $false

    # Create wake word grammar
    $wakeGrammar = New-Object System.Speech.Recognition.GrammarBuilder
    $wakeGrammar.Append($WakeWord)
    $wakeGrammarBuilder = New-Object System.Speech.Recognition.Grammar($wakeGrammar)

    # Add wake word recognition handler
    $wakeWordHandler = {
        param($sender, $e)

        if (-not $wakeWordDetected) {
            $wakeWordDetected = $true
            Write-Host "" -ForegroundColor Green
            Write-Host "🎯 Wake word detected! Activating Elara..." -ForegroundColor Green

            Speak-Text "Hello! I'm Elara, your Azora OS assistant. How can I help you?"

            # Start command recognition
            Start-CommandRecognition
        }
    }

    # Register wake word handler
    Register-ObjectEvent -InputObject $speechRecognizer -EventName SpeechRecognized -Action $wakeWordHandler -SourceIdentifier "WakeWordDetected"

    # Load wake word grammar
    $speechRecognizer.LoadGrammar($wakeGrammarBuilder)

    # Start recognition
    $speechRecognizer.Enabled = $true
}

function Start-CommandRecognition {
    Write-Host "🎤 Listening for commands..." -ForegroundColor Cyan

    # Unload wake word grammar and load command grammar
    $speechRecognizer.UnloadAllGrammars()

    # Create command grammar with common voice commands
    $commands = @(
        "show system status",
        "what is my system status",
        "launch services",
        "start azora services",
        "open calculator",
        "open notepad",
        "open browser",
        "search for",
        "help me",
        "what can you do",
        "tell me about azora",
        "azora status",
        "shutdown",
        "goodbye",
        "stop listening",
        "go to sleep"
    )

    $commandGrammar = New-Object System.Speech.Recognition.Choices
    $commandGrammar.Add($commands)

    # Add free text dictation for more natural commands
    $dictationGrammar = New-Object System.Speech.Recognition.DictationGrammar
    $dictationGrammar.Name = "Dictation"

    # Create grammar builder for commands
    $grammarBuilder = New-Object System.Speech.Recognition.GrammarBuilder
    $grammarBuilder.Append($commandGrammar)

    # Also allow free-form dictation
    $dictationBuilder = New-Object System.Speech.Recognition.GrammarBuilder
    $dictationBuilder.Append($dictationGrammar)

    $mainGrammar = New-Object System.Speech.Recognition.Grammar($grammarBuilder)
    $dictationGrammarObj = New-Object System.Speech.Recognition.Grammar($dictationBuilder)

    # Command recognition handler
    $commandHandler = {
        param($sender, $e)

        $recognizedText = $e.Result.Text.ToLower().Trim()
        Write-Host "🎯 Recognized: '$recognizedText'" -ForegroundColor Yellow

        $lastActivity = Get-Date

        # Process the command
        $response = Process-VoiceCommand -Command $recognizedText

        if ($response) {
            Speak-Text $response
        }

        # Check if we should stop listening
        if ($recognizedText -like "*shutdown*" -or
            $recognizedText -like "*goodbye*" -or
            $recognizedText -like "*stop listening*" -or
            $recognizedText -like "*go to sleep*") {

            Write-Host "😴 Elara going to sleep..." -ForegroundColor Cyan
            Speak-Text "Goodbye! Say '$WakeWord' to wake me up again."

            # Reset to wake word detection
            $wakeWordDetected = $false
            Start-WakeWordDetection
        }
    }

    # Register command handler
    Register-ObjectEvent -InputObject $speechRecognizer -EventName SpeechRecognized -Action $commandHandler -SourceIdentifier "CommandRecognized"

    # Load grammars
    $speechRecognizer.LoadGrammar($mainGrammar)
    $speechRecognizer.LoadGrammar($dictationGrammarObj)
}

function Process-VoiceCommand {
    param([string]$Command)

    $cmd = $Command.ToLower().Trim()

    try {
        # System status commands
        if ($cmd -like "*system status*" -or $cmd -like "*system info*") {
            return Get-SystemStatusResponse
        }

        # Service management
        if ($cmd -like "*launch*" -or $cmd -like "*start*") {
            return "Launching Azora services. This may take a moment."
        }

        # Application opening
        if ($cmd -like "*open calculator*") {
            Start-Process calc.exe
            return "Opening calculator for you."
        }

        if ($cmd -like "*open notepad*") {
            Start-Process notepad.exe
            return "Opening Notepad."
        }

        if ($cmd -like "*open browser*") {
            Start-Process "https://www.google.com"
            return "Opening your default web browser."
        }

        # Search commands
        if ($cmd -like "*search for*") {
            $searchTerm = $cmd -replace "search for", ""
            $searchUrl = "https://www.google.com/search?q=" + [System.Web.HttpUtility]::UrlEncode($searchTerm.Trim())
            Start-Process $searchUrl
            return "Searching for $($searchTerm.Trim()) on Google."
        }

        # Help commands
        if ($cmd -like "*help*" -or $cmd -like "*what can you do*") {
            return Get-HelpResponse
        }

        # Azora-specific commands
        if ($cmd -like "*azora*") {
            return Get-AzoraResponse
        }

        # Weather (placeholder)
        if ($cmd -like "*weather*") {
            return "I'm sorry, weather information is not yet available. I can help you with system status, launching applications, or searching the web."
        }

        # Time
        if ($cmd -like "*time*" -or $cmd -like "*what time*") {
            $currentTime = Get-Date -Format "h:mm tt"
            return "The current time is $currentTime."
        }

        # Date
        if ($cmd -like "*date*" -or $cmd -like "*what day*") {
            $currentDate = Get-Date -Format "dddd, MMMM d, yyyy"
            return "Today is $currentDate."
        }

        # Default response
        return "I heard '$Command'. I'm still learning how to help with that. Try asking for system status, help, or to open applications."

    } catch {
        return "I encountered an error processing your request. Please try again."
    }
}

function Get-SystemStatusResponse {
    $cpu = Get-WmiObject Win32_Processor | Select-Object -First 1
    $memory = Get-WmiObject Win32_OperatingSystem
    $totalMemory = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 1)
    $freeMemory = [math]::Round($memory.FreePhysicalMemory / 1MB, 1)

    $uptime = (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
    $uptimeString = "{0} days, {1} hours, {2} minutes" -f $uptime.Days, $uptime.Hours, $uptime.Minutes

    return "Your system is running Azora OS on Windows. CPU usage is approximately $($cpu.LoadPercentage)%. You have $freeMemory GB of free memory out of $totalMemory GB total. System uptime is $uptimeString."
}

function Get-HelpResponse {
    return "I can help you with: system status, launching applications like calculator or notepad, searching the web, telling time and date, and providing information about Azora OS. Just speak naturally - I'm here to assist!"
}

function Get-AzoraResponse {
    return "Azora OS is a revolutionary operating system with quantum-secure AI governance. It features Elara, the omniscient AI assistant, along with 147+ services for education, finance, security, and more. I'm here to help you navigate and utilize all its capabilities."
}

function Start-SystemTrayIcon {
    # Create system tray icon
    $notifyIcon = New-Object System.Windows.Forms.NotifyIcon
    $notifyIcon.Icon = [System.Drawing.SystemIcons]::Information
    $notifyIcon.Text = "Azora OS - Elara Voice Assistant"
    $notifyIcon.Visible = $true

    # Create context menu
    $contextMenu = New-Object System.Windows.Forms.ContextMenuStrip

    $statusItem = New-Object System.Windows.Forms.ToolStripMenuItem
    $statusItem.Text = "Show Status"
    $statusItem.Add_Click({
        $status = Get-SystemStatusResponse
        Speak-Text $status
    })

    $exitItem = New-Object System.Windows.Forms.ToolStripMenuItem
    $exitItem.Text = "Exit Elara"
    $exitItem.Add_Click({
        $notifyIcon.Visible = $false
        $speechRecognizer.Enabled = $false
        if ($speechSynthesizer) {
            $speechSynthesizer.Dispose()
        }
        [System.Windows.Forms.Application]::Exit()
    })

    $contextMenu.Items.Add($statusItem)
    $contextMenu.Items.Add($exitItem)
    $notifyIcon.ContextMenuStrip = $contextMenu

    # Show initial notification
    $notifyIcon.ShowBalloonTip(5000, "Azora OS", "Elara voice assistant is active. Say '$WakeWord' to begin.", [System.Windows.Forms.ToolTipIcon]::Info)

    return $notifyIcon
}

function Start-ContinuousMonitoring {
    # Monitor for silence timeout
    while ($isListening) {
        Start-Sleep -Milliseconds 1000

        if ($wakeWordDetected) {
            $timeSinceLastActivity = (Get-Date) - $lastActivity
            if ($timeSinceLastActivity.TotalMilliseconds -gt $SilenceTimeout) {
                Write-Host "⏰ Silence timeout - returning to wake word detection..." -ForegroundColor Yellow
                Speak-Text "Going back to sleep. Say '$WakeWord' to wake me up."

                $wakeWordDetected = $false
                Start-WakeWordDetection
            }
        }
    }
}

# Main execution
try {
    Write-Host "🌌 AZORA OS - ELARA VOICE ASSISTANT" -ForegroundColor Cyan
    Write-Host "=" * 50 -ForegroundColor Cyan
    Write-Host ""

    # Initialize voice engine
    if (-not (Initialize-VoiceEngine)) {
        exit 1
    }

    # Start system tray
    $trayIcon = Start-SystemTrayIcon

    # Welcome message
    Speak-Text "Azora OS voice interface activated. I am Elara, your AI assistant. Say '$WakeWord' to begin our conversation."

    # Start wake word detection
    Start-WakeWordDetection

    # Start continuous monitoring if requested
    if ($Continuous) {
        Start-ContinuousMonitoring
    }

    # Keep the application running
    Write-Host "🎤 Elara is listening... Press Ctrl+C to exit" -ForegroundColor Green
    Write-Host ""

    # Create a Windows Forms application to keep it running
    $app = New-Object System.Windows.Forms.ApplicationContext
    [System.Windows.Forms.Application]::Run($app)

} catch {
    Write-Error "💥 Fatal error: $($_.Exception.Message)"
} finally {
    # Cleanup
    if ($speechRecognizer) {
        $speechRecognizer.Enabled = $false
        $speechRecognizer.Dispose()
    }
    if ($speechSynthesizer) {
        $speechSynthesizer.Dispose()
    }
    if ($trayIcon) {
        $trayIcon.Visible = $false
        $trayIcon.Dispose()
    }

    # Unregister events
    Get-EventSubscriber | Unregister-Event
}
