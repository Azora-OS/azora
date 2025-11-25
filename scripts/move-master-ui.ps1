#!/usr/bin/env pwsh
# Move master-ui from packages to apps

$ErrorActionPreference = "Stop"

Write-Host "Moving master-ui from packages to apps..." -ForegroundColor Cyan
Write-Host ""

$source = "c:\Users\Azora Sapiens\Documents\azora\packages\@azora\master-ui"
$dest = "c:\Users\Azora Sapiens\Documents\azora\apps\azora-master"

if (Test-Path $source) {
    Write-Host "Moving master-ui..." -ForegroundColor Yellow
    
    # Move directory
    Move-Item -Path $source -Destination $dest -Force
    
    # Update package.json to be a Next.js app
    $packageJsonPath = Join-Path $dest "package.json"
    if (Test-Path $packageJsonPath) {
        $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
        
        # Update name
        $packageJson.name = "azora-master"
        
        # Add scripts if missing
        if (-not $packageJson.scripts) {
            $packageJson | Add-Member -MemberType NoteProperty -Name "scripts" -Value @{}
        }
        $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "dev" -Value "next dev" -Force
        $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "build" -Value "next build" -Force
        $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "start" -Value "next start" -Force
        $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "lint" -Value "next lint" -Force
        
        # Make it private
        $packageJson.private = $true
        
        $packageJson | ConvertTo-Json -Depth 100 | Set-Content $packageJsonPath
        Write-Host "  Updated package.json" -ForegroundColor Green
    }
    
    # Create app directory structure if needed
    $appDir = Join-Path $dest "app"
    if (-not (Test-Path $appDir)) {
        New-Item -ItemType Directory -Path $appDir -Force | Out-Null
        
        # Create basic layout.tsx
        $layout = @"
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Azora Master | System Administration',
  description: 'Control Your Ecosystem',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
"@
        Set-Content "$appDir\layout.tsx" $layout
        
        # Create basic page.tsx
        $page = @"
'use client';

import { GradientText } from '../components/GradientText';
import { PremiumButton } from '../components/PremiumButton';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-8 px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="space-y-4">
        <h1 className="text-6xl font-bold tracking-tighter">
          Welcome to <GradientText>Azora Master</GradientText>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          System Administration and Monitoring
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold mb-2">System Health</h3>
          <p className="text-gray-400 mb-4">Monitor system status and health.</p>
          <PremiumButton>View Dashboard</PremiumButton>
        </div>
        
        <div className="p-6 rounded-xl bg-white/5 border border-primary/50">
          <h3 className="text-xl font-bold mb-2">User Management</h3>
          <p className="text-gray-400 mb-4">Manage users and permissions.</p>
          <PremiumButton>Manage Users</PremiumButton>
        </div>
        
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold mb-2">Configuration</h3>
          <p className="text-gray-400 mb-4">Configure system settings.</p>
          <PremiumButton>Open Settings</PremiumButton>
        </div>
      </div>
    </div>
  );
}
"@
        Set-Content "$appDir\page.tsx" $page
        
        # Create globals.css
        $globalsCss = @"
@tailwind base;
@tailwind components;
@tailwind utilities;
"@
        Set-Content "$appDir\globals.css" $globalsCss
        
        Write-Host "  Created app directory structure" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Move complete!" -ForegroundColor Green
    Write-Host "  master-ui is now azora-master in apps/" -ForegroundColor Gray
} else {
    Write-Host "master-ui not found in packages/@azora/" -ForegroundColor Red
}
