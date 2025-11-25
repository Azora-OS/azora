#!/usr/bin/env pwsh
# Scaffold Missing Apps for Azora Product Suite
# Creates 6 missing apps with proper structure and integration

$ErrorActionPreference = "Stop"

Write-Host "Scaffolding missing Azora Product Suite apps..." -ForegroundColor Cyan
Write-Host ""

$appsDir = "c:\Users\Azora Sapiens\Documents\azora\apps"

# Define apps to scaffold
$appsToScaffold = @(
    @{
        Name = "azora-mint"
        Title = "Azora Mint"
        Description = "Proof-of-Knowledge Token Mining Dashboard"
        Tagline = "Learn, Earn, Mine"
        Service = "azora-mint"
    },
    @{
        Name = "azora-classroom"
        Title = "Azora Classroom"
        Description = "Live Virtual Classrooms and Collaboration"
        Tagline = "Virtual Classrooms, Real Learning"
        Service = "azora-classroom"
    },
    @{
        Name = "azora-library"
        Title = "Azora Library"
        Description = "Knowledge Base and Research Hub"
        Tagline = "Knowledge for All"
        Service = "azora-library"
    },
    @{
        Name = "azora-oracle"
        Title = "Azora Oracle"
        Description = "AI-Powered Business Intelligence"
        Tagline = "Your AI Business Advisor"
        Service = "ai-family-service"
    },
    @{
        Name = "azora-research-center"
        Title = "Azora Research Center"
        Description = "Academic Research and Collaboration Platform"
        Tagline = "Advance Knowledge"
        Service = "azora-research-center"
    }
)

function New-NextJsApp {
    param(
        [string]$Name,
        [string]$Title,
        [string]$Description,
        [string]$Tagline,
        [string]$Service
    )
    
    $appPath = Join-Path $appsDir $Name
    
    Write-Host "Creating $Title..." -ForegroundColor Yellow
    
    # Create directory structure
    New-Item -ItemType Directory -Path $appPath -Force | Out-Null
    New-Item -ItemType Directory -Path "$appPath\app" -Force | Out-Null
    New-Item -ItemType Directory -Path "$appPath\public" -Force | Out-Null
    
    # Create package.json
    $packageJson = @{
        name = $Name
        version = "0.1.0"
        private = $true
        scripts = @{
            dev = "next dev"
            build = "next build"
            start = "next start"
            lint = "next lint"
        }
        dependencies = @{
            react = "19.2.0"
            "react-dom" = "19.2.0"
            next = "16.0.3"
            "framer-motion" = "^11.0.8"
            "lucide-react" = "^0.344.0"
            clsx = "^2.1.0"
            "tailwind-merge" = "^2.2.1"
            "@azora/shared-design" = "*"
        }
        devDependencies = @{
            typescript = "^5"
            "@types/node" = "^20"
            "@types/react" = "^19"
            "@types/react-dom" = "^19"
            postcss = "^8"
            tailwindcss = "^4"
            "@tailwindcss/postcss" = "^4"
            eslint = "^9"
            "eslint-config-next" = "16.0.3"
        }
    }
    
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "$appPath\package.json"
    
    # Create tsconfig.json
    $tsconfig = @{
        compilerOptions = @{
            lib = @("dom", "dom.iterable", "esnext")
            allowJs = $true
            skipLibCheck = $true
            strict = $true
            noEmit = $true
            esModuleInterop = $true
            module = "esnext"
            moduleResolution = "bundler"
            resolveJsonModule = $true
            isolatedModules = $true
            jsx = "preserve"
            incremental = $true
            plugins = @(@{ name = "next" })
            paths = @{
                "@/*" = @("./*")
            }
        }
        include = @("next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts")
        exclude = @("node_modules")
    }
    
    $tsconfig | ConvertTo-Json -Depth 10 | Set-Content "$appPath\tsconfig.json"
    
    # Create next.config.js
    $nextConfig = @"
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@azora/shared-design'],
};

export default nextConfig;
"@
    Set-Content "$appPath\next.config.js" $nextConfig
    
    # Create tailwind.config.ts
    $tailwindConfig = @"
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
"@
    Set-Content "$appPath\tailwind.config.ts" $tailwindConfig
    
    # Create app/layout.tsx
    $layout = @"
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@azora/shared-design/theme/azora-theme.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '$Title | $Tagline',
  description: '$Description',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang=`"en`">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
"@
    Set-Content "$appPath\app\layout.tsx" $layout
    
    # Create app/page.tsx
    $page = @"
'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <AppLayout appName=`"$Title`" userName=`"Azora Citizen`">
      <div className=`"flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 px-4`">
        <div className=`"space-y-4`">
          <h1 className=`"text-6xl font-bold tracking-tighter`">
            Welcome to <GradientText>$Title</GradientText>
          </h1>
          <p className=`"text-xl text-gray-400 max-w-2xl mx-auto`">
            $Description
          </p>
        </div>

        <div className=`"grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl`">
          <AccessibleCard title=`"Getting Started`" className=`"p-6`">
            <p className=`"text-gray-400 mb-4`">Learn how to use $Title effectively.</p>
            <Button variant=`"outline`" className=`"w-full`">
              View Guide
            </Button>
          </AccessibleCard>

          <AccessibleCard title=`"Dashboard`" className=`"p-6 border-primary/50`">
            <p className=`"text-gray-400 mb-4`">Access your main dashboard.</p>
            <Button variant=`"primary`" className=`"w-full`">
              Go to Dashboard
            </Button>
          </AccessibleCard>

          <AccessibleCard title=`"Settings`" className=`"p-6`">
            <p className=`"text-gray-400 mb-4`">Configure your preferences.</p>
            <Button variant=`"outline`" className=`"w-full`">
              Open Settings
            </Button>
          </AccessibleCard>
        </div>
      </div>
    </AppLayout>
  );
}
"@
    Set-Content "$appPath\app\page.tsx" $page
    
    # Create app/globals.css
    $globalsCss = @"
@tailwind base;
@tailwind components;
@tailwind utilities;
"@
    Set-Content "$appPath\app\globals.css" $globalsCss
    
    # Create .gitignore
    $gitignore = @"
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
"@
    Set-Content "$appPath\.gitignore" $gitignore
    
    Write-Host "  Created $Title" -ForegroundColor Green
}

# Scaffold each app
foreach ($app in $appsToScaffold) {
    New-NextJsApp @app
    Write-Host ""
}

Write-Host "Scaffolding complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Created apps:" -ForegroundColor Cyan
foreach ($app in $appsToScaffold) {
    Write-Host "  - $($app.Title)" -ForegroundColor Gray
}
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run npm install in the root directory"
Write-Host "  2. Test each app: cd apps/<app-name> && npm run dev"
Write-Host "  3. Integrate with backend services"
