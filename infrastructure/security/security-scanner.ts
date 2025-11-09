import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: string
  file: string
  line?: number
  description: string
  recommendation: string
}

export class SecurityScanner {
  private issues: SecurityIssue[] = []
  private projectRoot: string

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot
  }

  // Run comprehensive security scan
  async runFullScan(): Promise<SecurityIssue[]> {
    this.issues = []
    
    await Promise.all([
      this.scanDependencies(),
      this.scanSourceCode(),
      this.scanConfiguration(),
      this.scanSecrets(),
      this.scanPermissions()
    ])

    return this.issues
  }

  // Scan for vulnerable dependencies
  async scanDependencies(): Promise<void> {
    try {
      const { stdout } = await execAsync('npm audit --json', { cwd: this.projectRoot })
      const auditResult = JSON.parse(stdout)

      if (auditResult.vulnerabilities) {
        for (const [pkg, vuln] of Object.entries(auditResult.vulnerabilities)) {
          this.issues.push({
            severity: this.mapSeverity(vuln.severity),
            type: 'dependency',
            file: 'package.json',
            description: `Vulnerable dependency: ${pkg} - ${vuln.title}`,
            recommendation: `Update ${pkg} to version ${vuln.fixAvailable?.version || 'latest'}`
          })
        }
      }
    } catch (error) {
      console.warn('Dependency scan failed:', error.message)
    }
  }

  // Scan source code for security issues
  async scanSourceCode(): Promise<void> {
    const sourceFiles = await this.getSourceFiles()
    
    for (const file of sourceFiles) {
      await this.scanFile(file)
    }
  }

  // Scan individual file for security issues
  private async scanFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        this.checkForSecurityPatterns(line, index + 1, filePath)
      })
    } catch (error) {
      console.warn(`Failed to scan file ${filePath}:`, error.message)
    }
  }

  // Check for security anti-patterns
  private checkForSecurityPatterns(line: string, lineNumber: number, filePath: string): void {
    const patterns = [
      {
        regex: /password\s*=\s*['"]\w+['"]/i,
        severity: 'critical' as const,
        type: 'hardcoded-secret',
        description: 'Hardcoded password detected',
        recommendation: 'Use environment variables for passwords'
      },
      {
        regex: /api[_-]?key\s*=\s*['"]\w+['"]/i,
        severity: 'critical' as const,
        type: 'hardcoded-secret',
        description: 'Hardcoded API key detected',
        recommendation: 'Use environment variables for API keys'
      },
      {
        regex: /eval\s*\(/,
        severity: 'high' as const,
        type: 'code-injection',
        description: 'Use of eval() detected',
        recommendation: 'Avoid eval() - use safer alternatives'
      },
      {
        regex: /innerHTML\s*=/,
        severity: 'medium' as const,
        type: 'xss',
        description: 'Potential XSS via innerHTML',
        recommendation: 'Use textContent or sanitize HTML'
      },
      {
        regex: /document\.write\s*\(/,
        severity: 'medium' as const,
        type: 'xss',
        description: 'Use of document.write detected',
        recommendation: 'Use safer DOM manipulation methods'
      },
      {
        regex: /console\.log\s*\(/,
        severity: 'low' as const,
        type: 'information-disclosure',
        description: 'Console.log in production code',
        recommendation: 'Remove console.log statements from production'
      },
      {
        regex: /TODO|FIXME|HACK/i,
        severity: 'low' as const,
        type: 'code-quality',
        description: 'TODO/FIXME comment found',
        recommendation: 'Address TODO items before production'
      }
    ]

    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        this.issues.push({
          severity: pattern.severity,
          type: pattern.type,
          file: filePath,
          line: lineNumber,
          description: pattern.description,
          recommendation: pattern.recommendation
        })
      }
    }
  }

  // Scan configuration files
  async scanConfiguration(): Promise<void> {
    const configFiles = [
      'package.json',
      '.env',
      '.env.example',
      'docker-compose.yml',
      'Dockerfile'
    ]

    for (const configFile of configFiles) {
      const filePath = path.join(this.projectRoot, configFile)
      try {
        await fs.access(filePath)
        await this.scanConfigFile(filePath)
      } catch {
        // File doesn't exist, skip
      }
    }
  }

  // Scan configuration file for security issues
  private async scanConfigFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      
      // Check for insecure configurations
      if (filePath.endsWith('package.json')) {
        const pkg = JSON.parse(content)
        
        // Check for outdated Node.js version
        if (pkg.engines?.node) {
          const nodeVersion = pkg.engines.node.replace(/[^\d.]/g, '')
          if (parseFloat(nodeVersion) < 18) {
            this.issues.push({
              severity: 'medium',
              type: 'outdated-runtime',
              file: filePath,
              description: 'Outdated Node.js version specified',
              recommendation: 'Update to Node.js 18+ for security patches'
            })
          }
        }
      }

      if (filePath.includes('.env')) {
        const lines = content.split('\n')
        lines.forEach((line, index) => {
          if (line.includes('localhost') && !filePath.includes('.example')) {
            this.issues.push({
              severity: 'low',
              type: 'configuration',
              file: filePath,
              line: index + 1,
              description: 'Localhost configuration in environment file',
              recommendation: 'Use production URLs in production environment'
            })
          }
        })
      }
    } catch (error) {
      console.warn(`Failed to scan config file ${filePath}:`, error.message)
    }
  }

  // Scan for exposed secrets
  async scanSecrets(): Promise<void> {
    const secretPatterns = [
      {
        name: 'AWS Access Key',
        regex: /AKIA[0-9A-Z]{16}/,
        severity: 'critical' as const
      },
      {
        name: 'Private Key',
        regex: /-----BEGIN (RSA )?PRIVATE KEY-----/,
        severity: 'critical' as const
      },
      {
        name: 'JWT Secret',
        regex: /jwt[_-]?secret/i,
        severity: 'high' as const
      },
      {
        name: 'Database URL',
        regex: /postgresql:\/\/.*:.*@/,
        severity: 'high' as const
      }
    ]

    const files = await this.getSourceFiles()
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8')
        
        for (const pattern of secretPatterns) {
          if (pattern.regex.test(content)) {
            this.issues.push({
              severity: pattern.severity,
              type: 'exposed-secret',
              file,
              description: `Potential ${pattern.name} exposed in code`,
              recommendation: 'Move secrets to environment variables or secure vault'
            })
          }
        }
      } catch (error) {
        console.warn(`Failed to scan secrets in ${file}:`, error.message)
      }
    }
  }

  // Check file permissions
  async scanPermissions(): Promise<void> {
    const sensitiveFiles = [
      '.env',
      'private.key',
      'id_rsa',
      'config/secrets.json'
    ]

    for (const file of sensitiveFiles) {
      const filePath = path.join(this.projectRoot, file)
      try {
        const stats = await fs.stat(filePath)
        const mode = stats.mode & parseInt('777', 8)
        
        if (mode & parseInt('044', 8)) { // World readable
          this.issues.push({
            severity: 'high',
            type: 'file-permissions',
            file: filePath,
            description: 'Sensitive file is world-readable',
            recommendation: 'Restrict file permissions (chmod 600)'
          })
        }
      } catch {
        // File doesn't exist, skip
      }
    }
  }

  // Get all source files
  private async getSourceFiles(): Promise<string[]> {
    const files: string[] = []
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.env']
    
    const scanDir = async (dir: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          
          if (entry.isDirectory()) {
            // Skip node_modules and other build directories
            if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
              await scanDir(fullPath)
            }
          } else if (extensions.some(ext => entry.name.endsWith(ext))) {
            files.push(fullPath)
          }
        }
      } catch (error) {
        console.warn(`Failed to scan directory ${dir}:`, error.message)
      }
    }

    await scanDir(this.projectRoot)
    return files
  }

  // Map npm audit severity to our severity levels
  private mapSeverity(npmSeverity: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (npmSeverity) {
      case 'critical': return 'critical'
      case 'high': return 'high'
      case 'moderate': return 'medium'
      case 'low': return 'low'
      default: return 'medium'
    }
  }

  // Generate security report
  generateReport(): string {
    const summary = this.getSummary()
    let report = `# Security Scan Report\n\n`
    report += `**Scan Date**: ${new Date().toISOString()}\n`
    report += `**Total Issues**: ${this.issues.length}\n\n`
    
    report += `## Summary\n`
    report += `- Critical: ${summary.critical}\n`
    report += `- High: ${summary.high}\n`
    report += `- Medium: ${summary.medium}\n`
    report += `- Low: ${summary.low}\n\n`

    if (this.issues.length > 0) {
      report += `## Issues\n\n`
      
      for (const issue of this.issues.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return severityOrder[b.severity] - severityOrder[a.severity]
      })) {
        report += `### ${issue.severity.toUpperCase()}: ${issue.description}\n`
        report += `**File**: ${issue.file}${issue.line ? `:${issue.line}` : ''}\n`
        report += `**Type**: ${issue.type}\n`
        report += `**Recommendation**: ${issue.recommendation}\n\n`
      }
    }

    return report
  }

  // Get issue summary
  getSummary(): { critical: number; high: number; medium: number; low: number } {
    return {
      critical: this.issues.filter(i => i.severity === 'critical').length,
      high: this.issues.filter(i => i.severity === 'high').length,
      medium: this.issues.filter(i => i.severity === 'medium').length,
      low: this.issues.filter(i => i.severity === 'low').length
    }
  }

  // Check if scan passed (no critical or high issues)
  isPassing(): boolean {
    return !this.issues.some(i => i.severity === 'critical' || i.severity === 'high')
  }
}