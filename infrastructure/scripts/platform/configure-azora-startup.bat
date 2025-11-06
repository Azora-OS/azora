
@echo off
echo Configuring Azora OS startup...
echo This would add Azora OS to Windows startup
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "AzoraOS" /t REG_SZ /d "C:\Users\Sizwe Ngwenya\Desktop\azora-os\transform-windows-to-azora.ts" /f
echo Azora OS will now start automatically with Windows
    