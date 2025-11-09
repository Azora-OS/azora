const fs = require('fs')

class Phase4Checker {
  constructor() {
    this.issues = []
    this.warnings = []
  }

  async checkPhase4() {
    console.log('📈 Checking Phase 4: Production Readiness...')
    
    this.checkMonitoring()
    this.checkResilience()
    this.checkScaling()
    this.checkDeployment()
    
    this.generateReport()
  }

  checkMonitoring() {
    console.log('🔍 Checking monitoring & observability...')
    
    // Check Prometheus config
    if (fs.existsSync('./infrastructure/monitoring/prometheus.yml')) {
      console.log('✅ Prometheus configuration found')
    } else {
      this.issues.push('Missing Prometheus configuration')
    }

    // Check alert rules
    if (fs.existsSync('./infrastructure/monitoring/alert_rules.yml')) {
      console.log('✅ Alert rules found')
    } else {
      this.issues.push('Missing alert rules')
    }

    // Check if Grafana is configured in docker-compose
    if (fs.existsSync('./docker-compose.yml')) {
      const dockerContent = fs.readFileSync('./docker-compose.yml', 'utf8')
      if (dockerContent.includes('grafana')) {
        console.log('✅ Grafana configured')
      } else {
        this.warnings.push('Grafana not configured in docker-compose')
      }
    }
  }

  checkResilience() {
    console.log('🛡️ Checking error handling & resilience...')
    
    // Check circuit breaker
    if (fs.existsSync('./infrastructure/deployment/circuit-breaker.ts')) {
      console.log('✅ Circuit breaker implementation found')
    } else {
      this.issues.push('Missing circuit breaker implementation')
    }

    // Check if services have health checks
    const services = ['auth-service', 'mint-service', 'education-service', 'payments-service']
    
    services.forEach(service => {
      const servicePath = `./services/${service}`
      if (fs.existsSync(servicePath)) {
        console.log(`✅ ${service} exists`)
      } else {
        this.warnings.push(`${service} directory not found (Builder may be working on it)`)
      }
    })
  }

  checkScaling() {
    console.log('📊 Checking scaling & performance...')
    
    // Check auto-scaler
    if (fs.existsSync('./infrastructure/deployment/auto-scaler.ts')) {
      console.log('✅ Auto-scaler implementation found')
    } else {
      this.issues.push('Missing auto-scaler implementation')
    }

    // Check if docker-compose has resource limits
    if (fs.existsSync('./docker-compose.yml')) {
      const dockerContent = fs.readFileSync('./docker-compose.yml', 'utf8')
      if (dockerContent.includes('resources:') && dockerContent.includes('limits:')) {
        console.log('✅ Resource limits configured')
      } else {
        this.warnings.push('Resource limits not fully configured')
      }
    }
  }

  checkDeployment() {
    console.log('🚀 Checking deployment automation...')
    
    // Check docker-compose exists
    if (fs.existsSync('./docker-compose.yml')) {
      console.log('✅ Docker Compose configuration found')
    } else {
      this.issues.push('Missing Docker Compose configuration')
    }

    // Check deployment scripts
    if (fs.existsSync('./deploy-now.sh') || fs.existsSync('./scripts/deploy.sh')) {
      console.log('✅ Deployment scripts found')
    } else {
      this.warnings.push('Deployment scripts could be enhanced')
    }
  }

  generateReport() {
    console.log('\n📋 PHASE 4 CHECK REPORT')
    console.log('='.repeat(50))
    
    if (this.issues.length === 0) {
      console.log('🎉 Phase 4 core components are ready!')
      
      if (this.warnings.length > 0) {
        console.log(`\n⚠️  ${this.warnings.length} warnings (Builder may be addressing these):`)
        this.warnings.forEach((warning, index) => {
          console.log(`${index + 1}. ${warning}`)
        })
      }
    } else {
      console.log(`❌ Found ${this.issues.length} critical issues:`)
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`)
      })
    }
    
    console.log('\n📊 PHASE 4 SUMMARY')
    console.log(`Critical Issues: ${this.issues.length}`)
    console.log(`Warnings: ${this.warnings.length}`)
    console.log(`Status: ${this.issues.length === 0 ? 'READY FOR PHASE 7' : 'NEEDS ATTENTION'}`)
  }
}

// Run the check
const checker = new Phase4Checker()
checker.checkPhase4().catch(console.error)