import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { createHash } from 'crypto'

const execAsync = promisify(exec)

interface BackupConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
}

export class BackupManager {
  private config: BackupConfig
  private backupDir: string

  constructor(config: BackupConfig, backupDir: string = './backups') {
    this.config = config
    this.backupDir = backupDir
  }

  // Create database backup
  async createBackup(name?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupName = name || `azora-backup-${timestamp}`
    const backupPath = path.join(this.backupDir, `${backupName}.sql`)

    // Ensure backup directory exists
    await fs.mkdir(this.backupDir, { recursive: true })

    const command = `pg_dump -h ${this.config.host} -p ${this.config.port} -U ${this.config.username} -d ${this.config.database} -f ${backupPath}`

    try {
      const { stdout, stderr } = await execAsync(command, {
        env: { ...process.env, PGPASSWORD: this.config.password }
      })

      if (stderr && !stderr.includes('NOTICE')) {
        throw new Error(`Backup failed: ${stderr}`)
      }

      // Create checksum
      const checksum = await this.createChecksum(backupPath)
      await fs.writeFile(`${backupPath}.checksum`, checksum)

      console.log(`Backup created: ${backupPath}`)
      return backupPath
    } catch (error) {
      console.error('Backup creation failed:', error)
      throw error
    }
  }

  // Restore from backup
  async restoreBackup(backupPath: string): Promise<void> {
    // Verify checksum first
    const isValid = await this.verifyChecksum(backupPath)
    if (!isValid) {
      throw new Error('Backup file integrity check failed')
    }

    const command = `psql -h ${this.config.host} -p ${this.config.port} -U ${this.config.username} -d ${this.config.database} -f ${backupPath}`

    try {
      const { stdout, stderr } = await execAsync(command, {
        env: { ...process.env, PGPASSWORD: this.config.password }
      })

      if (stderr && !stderr.includes('NOTICE')) {
        throw new Error(`Restore failed: ${stderr}`)
      }

      console.log(`Backup restored from: ${backupPath}`)
    } catch (error) {
      console.error('Backup restore failed:', error)
      throw error
    }
  }

  // List available backups
  async listBackups(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.backupDir)
      return files.filter(file => file.endsWith('.sql'))
    } catch (error) {
      console.error('Failed to list backups:', error)
      return []
    }
  }

  // Delete old backups (keep last N)
  async cleanupBackups(keepCount: number = 10): Promise<void> {
    const backups = await this.listBackups()
    
    if (backups.length <= keepCount) {
      return
    }

    // Sort by creation time (newest first)
    const backupsWithStats = await Promise.all(
      backups.map(async (backup) => {
        const filePath = path.join(this.backupDir, backup)
        const stats = await fs.stat(filePath)
        return { name: backup, path: filePath, created: stats.birthtime }
      })
    )

    backupsWithStats.sort((a, b) => b.created.getTime() - a.created.getTime())

    // Delete old backups
    const toDelete = backupsWithStats.slice(keepCount)
    for (const backup of toDelete) {
      await fs.unlink(backup.path)
      // Also delete checksum file
      try {
        await fs.unlink(`${backup.path}.checksum`)
      } catch {
        // Checksum file might not exist
      }
      console.log(`Deleted old backup: ${backup.name}`)
    }
  }

  // Create checksum for backup file
  private async createChecksum(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath)
    return createHash('sha256').update(fileBuffer).digest('hex')
  }

  // Verify backup file integrity
  private async verifyChecksum(filePath: string): Promise<boolean> {
    try {
      const checksumPath = `${filePath}.checksum`
      const expectedChecksum = await fs.readFile(checksumPath, 'utf8')
      const actualChecksum = await this.createChecksum(filePath)
      return expectedChecksum.trim() === actualChecksum
    } catch (error) {
      console.error('Checksum verification failed:', error)
      return false
    }
  }

  // Schedule automatic backups
  scheduleBackups(intervalHours: number = 24): NodeJS.Timeout {
    const intervalMs = intervalHours * 60 * 60 * 1000
    
    return setInterval(async () => {
      try {
        await this.createBackup()
        await this.cleanupBackups()
      } catch (error) {
        console.error('Scheduled backup failed:', error)
      }
    }, intervalMs)
  }
}