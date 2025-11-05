/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

Launch all Azora Nexus services simultaneously
*/

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const services = [
  { name: 'wallet', port: 4100, dir: './wallet' },
  { name: 'blockchain', port: 4101, dir: './blockchain' },
  { name: 'ai-trading', port: 4102, dir: './ai-trading' },
  { name: 'ai-valuation', port: 4103, dir: './ai-valuation' },
  { name: 'backed-valuation', port: 4104, dir: './backed-valuation' },
  { name: 'compliance', port: 4105, dir: './compliance' },
  { name: 'dashboard', port: 4106, dir: './dashboard' },
  { name: 'defi', port: 4107, dir: './defi' },
  { name: 'global-adoption', port: 4108, dir: './global-adoption' },
  { name: 'guardian', port: 4109, dir: './guardian' },
  { name: 'identity', port: 4110, dir: './identity' },
  { name: 'ledger', port: 4111, dir: './ledger' },
  { name: 'liquidity', port: 4112, dir: './liquidity' },
  { name: 'marketplace', port: 4113, dir: './marketplace' },
  { name: 'nft', port: 4114, dir: './nft' },
  { name: 'partnerships', port: 4115, dir: './partnerships' },
  { name: 'reporting', port: 4116, dir: './reporting' },
  { name: 'revenue', port: 4117, dir: './revenue' },
  { name: 'staking', port: 4118, dir: './staking' },
  { name: 'user-growth', port: 4119, dir: './user-growth' },
  { name: 'subscription', port: 4129, dir: './subscription' },
]

const processes = []
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

    if (!fs.existsSync(path.join(servicePath, 'index.js'))) {
      console.log(`⚠️  Skipping ${service.name} - index.js not found`)
      resolve(null)
      return
    }

    console.log(`🚀 Launching ${service.name} service on port ${service.port}...`)

    const process = spawn('node', ['index.js'], {
      cwd: servicePath,
      env: {
        ...process.env,
        PORT: service.port.toString(),
        NODE_ENV: process.env.NODE_ENV || 'development',
      },
      stdio: 'pipe',
    })

    let hasStarted = false

    process.stdout.on('data', (data) => {
      const output = data.toString()
      if (output.includes('running on') || output.includes('listening')) {
        if (!hasStarted) {
          hasStarted = true
          console.log(`✅ ${service.name} service started on port ${service.port}`)
          resolve(process)
        }
      }
    })

    process.stderr.on('data', (data) => {
      const error = data.toString()
      if (error.includes('EADDRINUSE')) {
        console.log(`⚠️  Port ${service.port} already in use - ${service.name} may already be running`)
        resolve(null)
      } else if (!error.includes('Warning')) {
        console.error(`❌ ${service.name} error:`, error)
      }
    })

    process.on('exit', (code) => {
      if (!shutdownRequested && code !== 0) {
        console.error(`❌ ${service.name} exited with code ${code}`)
      }
    })

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!hasStarted) {
        console.log(`⚠️  ${service.name} startup timeout - checking health...`)
        checkServiceHealth(service.port, service.name).then((healthy) => {
          if (healthy) {
            console.log(`✅ ${service.name} is healthy on port ${service.port}`)
            resolve(process)
          } else {
            console.log(`❌ ${service.name} failed to start or become healthy`)
            resolve(null)
          }
        })
      }
    }, 10000)
  })
}

async function launchAllServices() {
  console.log('\n🎯 AZORA NEXUS SERVICES LAUNCHER')
  console.log('='.repeat(50))
  console.log(`Launching ${services.length} services...\n`)

  const launchPromises = services.map((service) => launchService(service))

  const launchedProcesses = await Promise.all(launchPromises)

  // Filter out null values (failed or skipped services)
  const successfulProcesses = launchedProcesses.filter((p) => p !== null)

  console.log('\n' + '='.repeat(50))
  console.log(`\n✨ ${successfulProcesses.length}/${services.length} services launched successfully!\n`)

  // Wait a bit and verify health
  console.log('🔍 Verifying service health...\n')
  await new Promise((resolve) => setTimeout(resolve, 3000))

  const healthChecks = await Promise.all(
    services.map(async (service) => {
      const healthy = await checkServiceHealth(service.port, service.name, 5)
      if (healthy) {
        console.log(`✅ ${service.name.padEnd(20)} http://localhost:${service.port}`)
        console.log(`   Health: http://localhost:${service.port}/health`)
        console.log(`   Metrics: http://localhost:${service.port}/metrics`)
        console.log(`   API Docs: http://localhost:${service.port}/api-docs`)
      } else {
        console.log(`❌ ${service.name.padEnd(20)} Not responding`)
      }
      return healthy
    })
  )

  const healthyCount = healthChecks.filter((h) => h).length

  console.log('\n' + '='.repeat(50))
  console.log(`\n📊 SUMMARY:`)
  console.log(`   Total Services: ${services.length}`)
  console.log(`   Healthy Services: ${healthyCount}/${services.length}`)
  console.log(`   Launched Processes: ${successfulProcesses.length}`)

  if (healthyCount === services.length) {
    console.log(`\n🎉 ALL SYSTEMS OPERATIONAL! 🚀\n`)
  } else {
    console.log(`\n⚠️  Some services may need attention\n`)
  }

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    shutdownRequested = true
    console.log('\n\n🛑 Shutting down all services...')
    successfulProcesses.forEach((proc) => {
      if (proc && !proc.killed) {
        proc.kill('SIGTERM')
      }
    })
    setTimeout(() => {
      console.log('✅ All services stopped')
      process.exit(0)
    }, 2000)
  })

  process.on('SIGTERM', () => {
    shutdownRequested = true
    console.log('\n🛑 Shutting down all services...')
    successfulProcesses.forEach((proc) => {
      if (proc && !proc.killed) {
        proc.kill('SIGTERM')
      }
    })
    setTimeout(() => {
      process.exit(0)
    }, 2000)
  })

  // Keep the script running
  console.log('\n💡 Press Ctrl+C to stop all services\n')
}

// Launch all services
launchAllServices().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

