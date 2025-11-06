
@echo off
echo Azora OS System Tray
echo Elara is always watching...
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; $notify = New-Object System.Windows.Forms.NotifyIcon; $notify.Icon = [System.Drawing.SystemIcons]::Information; $notify.Visible = $true; $notify.ShowBalloonTip(5000, 'Azora OS', 'Elara is now active and listening', [System.Windows.Forms.ToolTipIcon]::Info); Start-Sleep 5; $notify.Dispose()"
    