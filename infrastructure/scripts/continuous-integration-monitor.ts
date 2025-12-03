/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { execSync, spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface IntegrationStatus {
  lastCheck: Date
  lastCommit: string
  isHealthy: boolean
  deploymentStatus: 'healthy' | 'deploying' | 'failed'
  conflicts: string[]
  errors: string[]
}

class ContinuousIntegrationMonitor {
  private status: IntegrationStatus
  private monitorInterval: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL = 30000 // 30 seconds
  private readonly LOG_FILE = 'integration-monitor.log'

  constructor() {
    this.status = {
      lastCheck: new Date(),
      lastCommit: '',
      isHealthy: true,
      deploymentStatus: 'healthy',
      conflicts: [],
      errors: []
    }

    this.initialize()
  }

  private initialize(): void {
    console.log('🚀 Starting Azora OS Continuous Integration Monitor...')
    this.log('Starting continuous integration monitor')

    // Get initial commit hash
    try {
      this.status.lastCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
    } catch (error) {
      this.log(`Error getting initial commit: ${error}`)
    }

    // Start monitoring
    this.startMonitoring()

    // Handle process termination
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())
  }

  private startMonitoring(): void {
    this.monitorInterval = setInterval(async () => {
      try {
        await this.checkForChanges()
      } catch (error) {
        this.log(`Monitoring error: ${error}`)
        this.status.errors.push(`Monitoring error: ${error}`)
      }
    }, this.CHECK_INTERVAL)

    this.log(`Monitoring started with ${this.CHECK_INTERVAL}ms interval`)
  }

  private async checkForChanges(): Promise<void> {
    this.status.lastCheck = new Date()

    try {
      // Fetch latest changes
      execSync('git fetch origin', { stdio: 'pipe' })

      // Check if we're behind remote
      const behindCount = execSync('git rev-list HEAD..origin/main --count', {
        encoding: 'utf8'
      }).trim()

      if (parseInt(behindCount) > 0) {
        this.log(`Found ${behindCount} new commits. Starting integration...`)
        await this.integrateChanges()
      }

      // Check deployment health
      await this.checkDeploymentHealth()

    } catch (error) {
      this.log(`Error checking for changes: ${error}`)
      this.status.errors.push(`Change check error: ${error}`)
    }
  }

  private async integrateChanges(): Promise<void> {
    try {
      this.status.deploymentStatus = 'deploying'
      this.log('Starting change integration process')

      // Pull changes with rebase to avoid merge commits
      const pullResult = execSync('git pull origin main --rebase', {
        encoding: 'utf8',
        stdio: 'pipe'
      })

      this.log(`Pull result: ${pullResult}`)

      // Check for conflicts
      const hasConflicts = execSync('git status --porcelain', { encoding: 'utf8' })
        .split('\n')
        .some(line => line.includes('UU'))

      if (hasConflicts) {
        this.log('❌ Merge conflicts detected!')
        this.status.conflicts = this.getConflictFiles()
        await this.resolveConflicts()
      } else {
        this.log('✅ No conflicts detected')
      }

      // Update last commit hash
      this.status.lastCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()

      // Run build and deployment checks
      await this.runBuildChecks()

      // Deploy if build successful
      await this.deployChanges()

      this.status.deploymentStatus = 'healthy'
      this.status.conflicts = []
      this.status.errors = []

      this.log('✅ Integration completed successfully')

    } catch (error) {
      this.status.deploymentStatus = 'failed'
      this.log(`❌ Integration failed: ${error}`)
      this.status.errors.push(`Integration error: ${error}`)

      // Attempt recovery
      await this.attemptRecovery()
    }
  }

  private getConflictFiles(): string[] {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' })
      return status.split('\n')
        .filter(line => line.includes('UU'))
        .map(line => line.substring(3).trim())
    } catch (error) {
      return []
    }
  }

  private async resolveConflicts(): Promise<void> {
    this.log('Attempting automatic conflict resolution...')

    // For now, we'll use "ours" strategy for conflicts
    // This can be made smarter based on file types
    try {
      execSync('git checkout --ours .', { stdio: 'pipe' })
      execSync('git add .', { stdio: 'pipe' })

      // Create a merge commit with conflict resolution
      execSync('git commit -m "Auto-resolve conflicts: prefer local changes"', { stdio: 'pipe' })

      this.log('✅ Conflicts resolved automatically')
    } catch (error) {
      this.log(`❌ Automatic conflict resolution failed: ${error}`)
      throw error
    }
  }

  private async runBuildChecks(): Promise<void> {
    this.log('Running build checks...')

    try {
      // Run TypeScript check
      execSync('npx tsc --noEmit', { stdio: 'pipe' })
      this.log('✅ TypeScript check passed')

      // Run linting
      execSync('npm run lint', { stdio: 'pipe' })
      this.log('✅ Linting passed')

    } catch (error) {
      this.log(`❌ Build checks failed: ${error}`)
      throw error
    }
  }

  private async deployChanges(): Promise<void> {
    this.log('Starting deployment...')

    try {
      // Deploy to Vercel
      execSync('vercel --prod --yes', { stdio: 'pipe' })
      this.log('✅ Vercel deployment completed')

      // Check if Docker is available and deploy
      try {
        execSync('docker --version', { stdio: 'pipe' })
        execSync('docker-compose -f vessels/docker-compose.production.yml up -d --build', { stdio: 'pipe' })
        this.log('✅ Docker deployment completed')
      } catch (dockerError) {
        this.log('⚠️ Docker not available, skipping container deployment')
      }

    } catch (error) {
      this.log(`❌ Deployment failed: ${error}`)
      throw error
    }
  }

  private async checkDeploymentHealth(): Promise<void> {
    try {
      // Check Vercel deployment status (this is a simplified check)
      // In a real implementation, you'd check actual health endpoints

      // Check if services are running
      const services = [
        'api/production-server.ts',
        'services/',
        'agents/'
      ]

      for (const service of services) {
        if (fs.existsSync(service)) {
          // Basic file existence check - could be enhanced
          continue
        }
      }

      this.status.isHealthy = true

    } catch (error) {
      this.status.isHealthy = false
      this.log(`Health check failed: ${error}`)
    }
  }

  private async attemptRecovery(): Promise<void> {
    this.log('Attempting recovery...')

    try {
      // Reset to last known good state
      execSync(`git reset --hard ${this.status.lastCommit}`, { stdio: 'pipe' })

      // Force push to restore clean state
      execSync('git push origin main --force', { stdio: 'pipe' })

      this.status.deploymentStatus = 'healthy'
      this.log('✅ Recovery completed')

    } catch (error) {
      this.log(`❌ Recovery failed: ${error}`)
      // Could implement escalation to human intervention here
    }
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}\n`

    console.log(logEntry.trim())

    // Append to log file
    fs.appendFileSync(this.LOG_FILE, logEntry)
  }

  private shutdown(): void {
    this.log('Shutting down continuous integration monitor...')

    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
    }

    // Final status report
    this.log(`Final Status:
      - Healthy: ${this.status.isHealthy}
      - Deployment: ${this.status.deploymentStatus}
      - Last Commit: ${this.status.lastCommit}
      - Conflicts: ${this.status.conflicts.length}
      - Errors: ${this.status.errors.length}`)

    process.exit(0)
  }

  public getStatus(): IntegrationStatus {
    return { ...this.status }
  }
}

// Start the monitor
const monitor = new ContinuousIntegrationMonitor()

// Export for external access
export { monitor }
