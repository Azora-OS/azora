/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

MASTER LAUNCHER - Launch ALL Azora OS Services
*/

import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Default environment overrides for local launch
// Set mock keys only for development/testing
if ((process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') && !process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = 'mock-openai-key-for-development-only';
  console.warn('⚠️  Using mock OpenAI API key for development - this should never be used in production');
}
if (!process.env.MINT_MOCK_MODE) {
  process.env.MINT_MOCK_MODE = 'true'
}
if (!process.env.MINT_USE_PRISMA) {
  process.env.MINT_USE_PRISMA = 'false'
}
if (!process.env.MINT_ENABLE_BACKGROUND_JOBS) {
  process.env.MINT_ENABLE_BACKGROUND_JOBS = 'false'
}
if (!process.env.NEXUS_MOCK_MODE) {
  process.env.NEXUS_MOCK_MODE = 'true'
}
if (!process.env.NEXUS_ALLOW_OFFLINE) {
  process.env.NEXUS_ALLOW_OFFLINE = 'true'
}

// Main Azora Services
const mainServices = [
  {
    name: 'Azora Sapiens',
    port: 4200,
    dir: './services/azora-sapiens',
    file: 'sapiens-service.js',
    desc: 'Education Platform',
  },
  {
    name: 'Azora Forge',
    port: 12345,
    dir: './services/azora-forge',
    file: 'index.js',
    desc: 'Marketplace',
  },
  {
    name: 'Azora Covenant',
    port: 4099,
    dir: './services/azora-covenant',
    file: 'index.js',
    desc: 'Blockchain & Contracts',
  },
  {
    name: 'Azora Mint',
    port: 4300,
    dir: './services/azora-mint',
    file: 'src/index.ts',
    desc: 'Financial Services',
  },
  {
    name: 'Azora Aegis',
    port: 4000,
    dir: './services/azora-aegis',
    file: 'citadel.js',
    desc: 'Security & Compliance',
  },
  {
    name: 'Azora Nexus',
    port: 3006,
    dir: './services/azora-nexus',
    file: 'src/index.ts',
    desc: 'AI Recommendations',
  },
]

// Azora Nexus Sub-Services (21 services)
const nexusServices = [
  { name: 'wallet', port: 4100, dir: './services/azora-nexus/services/wallet' },
  { name: 'blockchain', port: 4101, dir: './services/azora-nexus/services/blockchain' },
  { name: 'ai-trading', port: 4102, dir: './services/azora-nexus/services/ai-trading' },
  { name: 'ai-valuation', port: 4103, dir: './services/azora-nexus/services/ai-valuation' },
  { name: 'backed-valuation', port: 4104, dir: './services/azora-nexus/services/backed-valuation' },
  { name: 'compliance', port: 4105, dir: './services/azora-nexus/services/compliance' },
  { name: 'dashboard', port: 4106, dir: './services/azora-nexus/services/dashboard' },
  { name: 'defi', port: 4107, dir: './services/azora-nexus/services/defi' },
  { name: 'global-adoption', port: 4108, dir: './services/azora-nexus/services/global-adoption' },
  { name: 'guardian', port: 4109, dir: './services/azora-nexus/services/guardian' },
  { name: 'identity', port: 4110, dir: './services/azora-nexus/services/identity' },
  { name: 'ledger', port: 4111, dir: './services/azora-nexus/services/ledger' },
  { name: 'liquidity', port: 4112, dir: './services/azora-nexus/services/liquidity' },
  { name: 'marketplace', port: 4113, dir: './services/azora-nexus/services/marketplace' },
  { name: 'nft', port: 4114, dir: './services/azora-nexus/services/nft' },
  { name: 'partnerships', port: 4115, dir: './services/azora-nexus/services/partnerships' },
  { name: 'reporting', port: 4116, dir: './services/azora-nexus/services/reporting' },
  { name: 'revenue', port: 4117, dir: './services/azora-nexus/services/revenue' },
  { name: 'staking', port: 4118, dir: './services/azora-nexus/services/staking' },
  { name: 'user-growth', port: 4119, dir: './services/azora-nexus/services/user-growth' },
  { name: 'subscription', port: 4129, dir: './services/azora-nexus/services/subscription' },
]

const allServices = [
  ...mainServices,
  ...nexusServices.map((s) => ({ ...s, file: 'index.js', desc: 'Nexus Service' })),
]

const processes = new Map()
let shutdownRequested = false

async function checkServiceHealth(port, serviceName, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1000)

      const response = await fetch(`http://localhost:${port}/health`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return true
      }
    } catch (error) {
      // Service not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return false
}

function launchService(service) {
  return new Promise((resolve, reject) => {
    const servicePath = path.resolve(__dirname, service.dir)
    const serviceFile = path.join(servicePath, service.file)

    // Check if file exists, try alternatives
    let actualFile = serviceFile
    if (!fs.existsSync(serviceFile)) {
      // Try index.js or index.ts
      const alternatives = ['index.js', 'index.ts', 'server.js', 'server.ts']
      for (const alt of alternatives) {
        const altPath = path.join(servicePath, alt)
        if (fs.existsSync(altPath)) {
          actualFile = altPath
          break
        }
      }
    }

    if (!fs.existsSync(actualFile)) {
      console.log(`⚠️  Skipping ${service.name} - ${service.file} not found`)
      resolve(null)
      return
    }

    console.log(
      `🚀 Launching ${service.name}${service.desc ? ' (' + service.desc + ')' : ''} on port ${service.port}...`
    )

    const isTypeScript = actualFile.endsWith('.ts')
    const command = isTypeScript ? 'npx' : 'node'
    const args = isTypeScript ? ['tsx', actualFile] : [actualFile]

    const childProcess = spawn(command, args, {
      cwd: servicePath,
      env: {
        ...process.env,
        PORT: service.port.toString(),
        NODE_ENV: process.env.NODE_ENV || 'development',
      },
      stdio: 'pipe',
    })

    let hasStarted = false
    let resolved = false

    const markResolved = (value) => {
      if (!resolved) {
        resolved = true
        resolve(value)
      }
    }

    const registerSuccessfulStart = (message) => {
      if (resolved) {
        return
      }
      if (!hasStarted) {
        hasStarted = true
        if (message) {
          console.log(message)
        }
      }
      if (!processes.has(service.name)) {
        processes.set(service.name, childProcess)
      }
      markResolved(childProcess)
    }

    childProcess.stdout.on('data', (data) => {
      const output = data.toString()
      if (
        output.includes('running on') ||
        output.includes('listening') ||
        output.includes('started')
      ) {
        registerSuccessfulStart(`✅ ${service.name} started on port ${service.port}`)
      }
    })

    childProcess.stderr.on('data', (data) => {
      const error = data.toString()
      if (error.includes('EADDRINUSE')) {
        console.log(
          `⚠️  Port ${service.port} already in use - ${service.name} may already be running`
        )
        markResolved(null)
      } else if (!error.includes('Warning') && !error.includes('Deprecation')) {
        // Don't spam with warnings
        if (error.includes('Error') || error.includes('error')) {
          console.error(`❌ ${service.name} error:`, error.substring(0, 200))
        }
      }
    })

    childProcess.on('exit', (code) => {
      if (!shutdownRequested && code !== 0) {
        console.error(`❌ ${service.name} exited with code ${code}`)
      }
      processes.delete(service.name)
    })

    // Timeout after 15 seconds
    setTimeout(() => {
      if (!hasStarted) {
        console.log(`⏳ ${service.name} startup taking longer than expected...`)
        checkServiceHealth(service.port, service.name, 5).then((healthy) => {
          if (healthy) {
            registerSuccessfulStart(`✅ ${service.name} is healthy on port ${service.port}`)
          } else {
            console.log(`⚠️  ${service.name} may need more time or has issues`)
            markResolved(null)
          }
        })
      }
    }, 15000)
  })
}

async function launchAllServices() {
  console.log('\n' + '='.repeat(60))
  console.log('🎯 AZORA OS - MASTER LAUNCHER')
  console.log('='.repeat(60))
  console.log(`\nLaunching ${allServices.length} services...`)
  console.log(`  - ${mainServices.length} main services`)
  console.log(`  - ${nexusServices.length} nexus sub-services\n`)

  // Launch main services first
  console.log('📦 Launching Main Services...\n')
  const mainPromises = mainServices.map((service) => launchService(service))
  await Promise.all(mainPromises)

  // Wait a bit before launching sub-services
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Launch nexus sub-services
  console.log('\n📦 Launching Nexus Sub-Services...\n')
  const nexusPromises = nexusServices.map((service) =>
    launchService({ ...service, file: 'index.js', desc: 'Nexus Service' })
  )
  await Promise.all(nexusPromises)

  console.log('\n' + '='.repeat(60))
  console.log(`\n✨ Launch complete! ${processes.size} processes running\n`)

  // Wait and verify health
  console.log('🔍 Verifying service health...\n')
  await new Promise((resolve) => setTimeout(resolve, 5000))

  const healthChecks = await Promise.all(
    allServices.map(async (service) => {
      const healthy = await checkServiceHealth(service.port, service.name, 5)
      if (healthy) {
        console.log(`✅ ${service.name.padEnd(25)} http://localhost:${service.port}`)
      } else {
        console.log(`⚠️  ${service.name.padEnd(25)} Starting or issues...`)
      }
      return healthy
    })
  )

  const healthyCount = healthChecks.filter((h) => h).length

  console.log('\n' + '='.repeat(60))
  console.log(`\n📊 LAUNCH SUMMARY:`)
  console.log(`   Total Services: ${allServices.length}`)
  console.log(`   Healthy Services: ${healthyCount}/${allServices.length}`)
  console.log(`   Running Processes: ${processes.size}`)
  console.log('\n💡 Main Service Endpoints:')
  mainServices.forEach((s) => {
    console.log(`   ${s.name.padEnd(20)} http://localhost:${s.port}/health`)
  })

  if (healthyCount === allServices.length) {
    console.log(`\n🎉 ALL SYSTEMS OPERATIONAL! 🚀\n`)
  } else if (healthyCount > allServices.length / 2) {
    console.log(`\n⚠️  Most services operational. Some may need attention.\n`)
  } else {
    console.log(`\n⚠️  Some services may need more time or have dependencies.\n`)
  }

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    shutdownRequested = true
    console.log('\n\n🛑 Shutting down all services...')
    processes.forEach((proc, name) => {
      if (proc && typeof proc.kill === 'function' && !proc.killed) {
        console.log(`   Stopping ${name}...`)
        try {
          proc.kill('SIGTERM')
        } catch (error) {
          const errMessage = error instanceof Error ? error.message : String(error)
          console.warn(`   Unable to stop ${name}: ${errMessage}`)
        }
      }
    })
    setTimeout(() => {
      console.log('✅ All services stopped')
      process.exit(0)
    }, 3000)
  })

  process.on('SIGTERM', () => {
    shutdownRequested = true
    console.log('\n🛑 Shutting down all services...')
    processes.forEach((proc, name) => {
      if (proc && typeof proc.kill === 'function' && !proc.killed) {
        try {
          proc.kill('SIGTERM')
        } catch (error) {
          const errMessage = error instanceof Error ? error.message : String(error)
          console.warn(`Unable to stop ${name}: ${errMessage}`)
        }
      }
    })
    setTimeout(() => {
      process.exit(0)
    }, 3000)
  })

  console.log('\n💡 Press Ctrl+C to stop all services\n')
}

// Launch everything
launchAllServices().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
