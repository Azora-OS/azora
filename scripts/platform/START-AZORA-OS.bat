@echo off
REM Quick Launcher for Azora OS
REM Double-click this file to start all Azora services

title Azora OS - Launching...

powershell -ExecutionPolicy Bypass -File "%~dp0START-AZORA-OS.ps1"

pause

