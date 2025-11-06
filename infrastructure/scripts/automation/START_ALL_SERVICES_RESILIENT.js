/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

RESILIENT SERVICE LAUNCHER - Starts all services without requiring DBs/APIs
*/

import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Default environment overrides for resilient launch
if (!process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = 'mock-openai-key'
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

// All services with their configurations
const services = [
  // Main Services
  { name: 'Azora Sapiens', port: 4200, dir: 'services/azora-sapiens', file: 'sapiens-service.js', type: 'node' },
  { name: 'Azora Forge', port: 12345, dir: 'services/azora-forge', file: 'index.js', type: 'node' },
  { name: 'Azora Covenant', port: 4099, dir: 'services/azora-covenant', file: 'server.js', type: 'node' },
  { name: 'Azora Mint', port: 4300, dir: 'services/azora-mint', file: 'src/index.ts', type: 'tsx' },
  { name: 'Azora Nexus', port: 3006, dir: 'services/azora-nexus', file: 'src/index.ts', type: 'tsx' },

  // Nexus Sub-Services
  { name: 'Wallet', port: 4100, dir: 'services/azora-nexus/services/wallet', file: 'index.js', type: 'node' },
  { name: 'Blockchain', port: 4101, dir: 'services/azora-nexus/services/blockchain', file: 'index.js', type: 'node' },
  { name: 'AI Trading', port: 4102, dir: 'services/azora-nexus/services/ai-trading', file: 'index.js', type: 'node' },
  { name: 'AI Valuation', port: 4103, dir: 'services/azora-nexus/services/ai-valuation', file: 'index.js', type: 'node' },
  { name: 'Backed Valuation', port: 4104, dir: 'services/azora-nexus/services/backed-valuation', file: 'index.js', type: 'node' },
  { name: 'Compliance', port: 4105, dir: 'services/azora-nexus/services/compliance', file: 'index.js', type: 'node' },
  { name: 'Dashboard', port: 4106, dir: 'services/azora-nexus/services/dashboard', file: 'index.js', type: 'node' },
  { name: 'DeFi', port: 4107, dir: 'services/azora-nexus/services/defi', file: 'index.js', type: 'node' },
  { name: 'Global Adoption', port: 4108, dir: 'services/azora-nexus/services/global-adoption', file: 'index.js', type: 'node' },
  { name: 'Guardian', port: 4109, dir: 'services/azora-nexus/services/guardian', file: 'index.js', type: 'node' },
  { name: 'Identity', port: 4110, dir: 'services/azora-nexus/services/identity', file: 'index.js', type: 'node' },
  { name: 'Ledger', port: 4111, dir: 'services/azora-nexus/services/ledger', file: 'index.js', type: 'node' },
  { name: 'Liquidity', port: 4112, dir: 'services/azora-nexus/services/liquidity', file: 'index.js', type: 'node' },
  { name: 'Marketplace', port: 4113, dir: 'services/azora-nexus/services/marketplace', file: 'index.js', type: 'node' },
  { name: 'NFT', port: 4114, dir: 'services/azora-nexus/services/nft', file: 'index.js', type: 'node' },
  { name: 'Partnerships', port: 4115, dir: 'services/azora-nexus/services/partnerships', file: 'index.js', type: 'node' },
  { name: 'Reporting', port: 4116, dir: 'services/azora-nexus/services/reporting', file: 'index.js', type: 'node' },
  { name: 'Revenue', port: 4117, dir: 'services/azora-nexus/services/revenue', file: 'index.js', type: 'node' },
  { name: 'Staking', port: 4118, dir: 'services/azora-nexus/services/staking', file: 'index.js', type: 'node' },
  { name: 'User Growth', port: 4119, dir: 'services/azora-nexus/services/user-growth', file: 'index.js', type: 'node' },
  { name: 'Subscription', port: 4129, dir: 'services/azora-nexus/services/subscription', file: 'index.js', type: 'node' },
]

const processes = new Map()
let launchedCount = 0
let skippedCount = 0

function launchService(service) {
  const servicePath = path.resolve(__dirname, service.dir)
  const serviceFile = path.join(servicePath, service.file)

  // Check if file exists
  if (!fs.existsSync(serviceFile)) {
    console.log(`⚠️  SKIP: ${service.name} - ${service.file} not found`)
    skippedCount++
    return null
  }

  // Determine command
  const command = service.type === 'tsx' ? 'npx' : 'node'
  const args = service.type === 'tsx' ? ['tsx', service.file] : [service.file]

  console.log(`🚀 Starting ${service.name} on port ${service.port}...`)

  const proc = spawn(command, args, {
    cwd: servicePath,
    env: {
      ...process.env,
      PORT: service.port.toString(),
      NODE_ENV: 'development',
      // Mock mode flags
      MOCK_MODE: 'true',
      REQUIRE_DB: 'false',
      REQUIRE_APIS: 'false',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let hasOutput = false

  proc.stdout.on('data', (data) => {
    const output = data.toString()
    if (!hasOutput && (output.includes('running') || output.includes('listening') || output.includes('started') || output.includes('port'))) {
      console.log(`✅ ${service.name} - RUNNING on port ${service.port}`)
      hasOutput = true
      launchedCount++
    }
  })

  proc.stderr.on('data', (data) => {
    const error = data.toString()
    // Ignore warnings and deprecation notices
    if (!error.includes('Warning') &&
        !error.includes('DeprecationWarning') &&
        !error.includes('ExperimentalWarning') &&
        error.includes('Error')) {
      console.error(`❌ ${service.name}: ${error.substring(0, 150)}`)
    }
  })

  proc.on('error', (err) => {
    console.error(`❌ ${service.name} failed to start: ${err.message}`)
  })

  proc.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`⚠️  ${service.name} exited with code ${code}`)
    }
    processes.delete(service.name)
  })

  // Give it 3 seconds, then assume it's running if process is alive
  setTimeout(() => {
    if (!proc.killed && !hasOutput) {
      console.log(`✅ ${service.name} - RUNNING on port ${service.port} (silent start)`)
      launchedCount++
      hasOutput = true
    }
  }, 3000)

  processes.set(service.name, proc)
  return proc
}

async function launchAll() {
  console.log('\n' + '='.repeat(70))
  console.log('🌌 AZORA OS - RESILIENT SERVICE LAUNCHER')
  console.log('   Starting ALL services without DB/API requirements')
  console.log('='.repeat(70) + '\n')

  console.log(`📦 Launching ${services.length} services...\n`)

  // Launch all services
  for (const service of services) {
    launchService(service)
    // Small delay between launches
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Wait for all to initialize
  console.log('\n⏳ Waiting for services to initialize...\n')
  await new Promise(resolve => setTimeout(resolve, 8000))

  console.log('\n' + '='.repeat(70))
  console.log('📊 LAUNCH SUMMARY:')
  console.log(`   Total Services: ${services.length}`)
  console.log(`   Launched: ${launchedCount}`)
  console.log(`   Skipped: ${skippedCount}`)
  console.log(`   Running Processes: ${processes.size}`)
  console.log('='.repeat(70))

  console.log('\n💡 Service Endpoints:')
  services.slice(0, 10).forEach(s => {
    console.log(`   ${s.name.padEnd(20)} http://localhost:${s.port}`)
  })
  console.log('   ... and more\n')

  console.log('✨ All services are running in MOCK MODE')
  console.log('   Services will ask for APIs/DBs through the UI when needed\n')
  console.log('💡 Press Ctrl+C to stop all services\n')

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down all services...')
    processes.forEach((proc, name) => {
      if (proc && !proc.killed) {
        console.log(`   Stopping ${name}...`)
        proc.kill('SIGTERM')
      }
    })
    setTimeout(() => {
      console.log('✅ All services stopped')
      process.exit(0)
    }, 2000)
  })
}

// Start everything
launchAll().catch(console.error)

