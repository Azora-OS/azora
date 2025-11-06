#!/usr/bin/env node
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * COMPREHENSIVE SYSTEM AUDIT
 * Professional-grade check of all services, APIs, and revenue streams
 */

const fs = require('fs')
const path = require('path')

console.log('\n' + '='.repeat(80))
console.log('🔍 AZORA OS - COMPREHENSIVE SYSTEM AUDIT')
console.log('   Enterprise-Grade Quality Check')
console.log('='.repeat(80) + '\n')

// AUDIT CATEGORIES
const audit = {
  apis: [],
  services: [],
  dashboards: [],
  revenueStreams: [],
  integrations: [],
  issues: [],
  recommendations: []
}

// 1. CHECK ALL API ENDPOINTS
console.log('1️⃣  AUDITING API ENDPOINTS...\n')

const apiDir = path.join(__dirname, 'ui', 'app', 'api')
if (fs.existsSync(apiDir)) {
  const checkAPIs = (dir, prefix = '') => {
    const items = fs.readdirSync(dir, { withFileTypes: true })
    items.forEach(item => {
      if (item.isDirectory()) {
        const routePath = path.join(dir, item.name)
        const routeFile = path.join(routePath, 'route.ts')
        if (fs.existsSync(routeFile)) {
          const endpoint = `${prefix}/${item.name}`
          const content = fs.readFileSync(routeFile, 'utf8')
          
          // Check for proper error handling
          const hasErrorHandling = content.includes('try') && content.includes('catch')
          const hasValidation = content.includes('if (') || content.includes('require')
          const hasSupabase = content.includes('supabase')
          
          audit.apis.push({
            endpoint,
            file: routeFile,
            hasErrorHandling,
            hasValidation,
            hasSupabase,
            status: hasErrorHandling && hasValidation ? 'GOOD' : 'NEEDS_WORK'
          })
          
          console.log(`   ${hasErrorHandling && hasValidation ? '✅' : '⚠️ '} ${endpoint}`)
          if (!hasErrorHandling) audit.issues.push(`Missing error handling: ${endpoint}`)
          if (!hasValidation) audit.issues.push(`Missing validation: ${endpoint}`)
        }
        checkAPIs(routePath, `${prefix}/${item.name}`)
      }
    })
  }
  
  checkAPIs(apiDir, '/api')
} else {
  audit.issues.push('API directory not found')
}

// 2. CHECK ALL SERVICES
console.log('\n2️⃣  AUDITING BACKEND SERVICES...\n')

const servicesDir = path.join(__dirname, 'services')
if (fs.existsSync(servicesDir)) {
  const services = fs.readdirSync(servicesDir, { withFileTypes: true })
  services.forEach(item => {
    if (item.name.endsWith('.ts') || item.name.endsWith('.js')) {
      const servicePath = path.join(servicesDir, item.name)
      const content = fs.readFileSync(servicePath, 'utf8')
      
      const hasExports = content.includes('export')
      const hasEventEmitter = content.includes('EventEmitter')
      const hasErrorHandling = content.includes('try') || content.includes('catch')
      
      audit.services.push({
        name: item.name,
        path: servicePath,
        hasExports,
        hasEventEmitter,
        hasErrorHandling,
        status: hasExports && hasErrorHandling ? 'GOOD' : 'NEEDS_WORK'
      })
      
      console.log(`   ${hasExports && hasErrorHandling ? '✅' : '⚠️ '} ${item.name}`)
    }
  })
}

// 3. CHECK AZORA MINT SERVICES
console.log('\n3️⃣  AUDITING AZORA MINT (Money System)...\n')

const mintDir = path.join(servicesDir, 'azora-mint')
if (fs.existsSync(mintDir)) {
  const mintServices = fs.readdirSync(mintDir, { withFileTypes: true })
  mintServices.forEach(item => {
    if (item.name.endsWith('.ts')) {
      const servicePath = path.join(mintDir, item.name)
      const content = fs.readFileSync(servicePath, 'utf8')
      
      // Check for revenue-generating functions
      const hasConversion = content.includes('convert') || content.includes('exchange')
      const hasWithdrawal = content.includes('withdraw')
      const hasLoan = content.includes('loan')
      const hasStaking = content.includes('stake')
      
      console.log(`   ${hasConversion || hasWithdrawal ? '✅' : '⚠️ '} ${item.name}`)
      
      if (hasConversion) audit.revenueStreams.push(`Conversion fees - ${item.name}`)
      if (hasLoan) audit.revenueStreams.push(`Loan interest - ${item.name}`)
      if (hasStaking) audit.revenueStreams.push(`Staking fees - ${item.name}`)
    }
  })
}

// 4. CHECK DASHBOARDS
console.log('\n4️⃣  AUDITING USER DASHBOARDS...\n')

const dashboardDir = path.join(__dirname, 'ui', 'app', 'dashboard')
if (fs.existsSync(dashboardDir)) {
  const checkDashboards = (dir, userType = '') => {
    const items = fs.readdirSync(dir, { withFileTypes: true })
    items.forEach(item => {
      if (item.isDirectory()) {
        const pagePath = path.join(dir, item.name, 'page.tsx')
        if (fs.existsSync(pagePath)) {
          const content = fs.readFileSync(pagePath, 'utf8')
          
          const hasState = content.includes('useState')
          const hasAPI = content.includes('fetch') || content.includes('api')
          const hasUI = content.includes('return')
          
          audit.dashboards.push({
            type: item.name,
            path: pagePath,
            hasState,
            hasAPI,
            hasUI,
            status: hasState && hasUI ? 'GOOD' : 'NEEDS_WORK'
          })
          
          console.log(`   ${hasState && hasUI ? '✅' : '⚠️ '} ${item.name} dashboard`)
        }
        checkDashboards(path.join(dir, item.name), item.name)
      }
    })
  }
  
  checkDashboards(dashboardDir)
}

// 5. CHECK INTEGRATIONS
console.log('\n5️⃣  AUDITING EXTERNAL INTEGRATIONS...\n')

const envFiles = ['.env.production', '.env.supabase']
envFiles.forEach(envFile => {
  const envPath = path.join(__dirname, envFile)
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    
    const integrations = {
      'Supabase': content.includes('SUPABASE_URL'),
      'Luno API': content.includes('LUNO_API_KEY_ID'),
      'OpenAI': content.includes('OPENAI_API_KEY'),
      'AssemblyAI': content.includes('ASSEMBLYAI_API_KEY'),
      'Alchemy': content.includes('MAINNET_RPC'),
      'Etherscan': content.includes('ETHERSCAN_API_KEY'),
      'UXCam': content.includes('UXCAM_APP_KEY'),
      'Datadog': content.includes('DATADOG_API_KEY')
    }
    
    Object.entries(integrations).forEach(([name, present]) => {
      console.log(`   ${present ? '✅' : '❌'} ${name}`)
      if (present) {
        audit.integrations.push({ name, status: 'CONFIGURED', file: envFile })
      } else {
        audit.issues.push(`${name} not configured in ${envFile}`)
      }
    })
  }
})

// 6. CHECK CODE QUALITY
console.log('\n6️⃣  CODE QUALITY CHECKS...\n')

const tsconfig = path.join(__dirname, 'tsconfig.json')
const packageJson = path.join(__dirname, 'package.json')

if (fs.existsSync(tsconfig)) {
  console.log('   ✅ TypeScript configuration present')
} else {
  audit.issues.push('Missing tsconfig.json')
}

if (fs.existsSync(packageJson)) {
  const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'))
  console.log(`   ✅ Package.json present (${Object.keys(pkg.dependencies || {}).length} dependencies)`)
  
  // Check for essential dependencies
  const essential = [
    '@supabase/supabase-js',
    'next',
    'react',
    'typescript'
  ]
  
  essential.forEach(dep => {
    if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
      console.log(`   ✅ ${dep}`)
    } else {
      audit.issues.push(`Missing dependency: ${dep}`)
    }
  })
}

// GENERATE REPORT
console.log('\n' + '='.repeat(80))
console.log('📊 AUDIT SUMMARY')
console.log('='.repeat(80) + '\n')

console.log(`APIs Found: ${audit.apis.length}`)
console.log(`Services Found: ${audit.services.length}`)
console.log(`Dashboards Found: ${audit.dashboards.length}`)
console.log(`Revenue Streams: ${audit.revenueStreams.length}`)
console.log(`Integrations: ${audit.integrations.length}`)
console.log(`Issues Found: ${audit.issues.length}`)

// REVENUE STREAMS
if (audit.revenueStreams.length > 0) {
  console.log('\n💰 REVENUE STREAMS:')
  audit.revenueStreams.forEach(stream => console.log(`   ✅ ${stream}`))
}

// ISSUES
if (audit.issues.length > 0) {
  console.log('\n⚠️  ISSUES TO FIX:')
  audit.issues.forEach(issue => console.log(`   ❌ ${issue}`))
}

// RECOMMENDATIONS
console.log('\n💡 RECOMMENDATIONS:')

if (audit.apis.filter(a => a.status === 'NEEDS_WORK').length > 0) {
  console.log('   → Add error handling to all API endpoints')
}

if (audit.apis.filter(a => !a.hasValidation).length > 0) {
  console.log('   → Add input validation to all APIs')
}

if (audit.integrations.length < 5) {
  console.log('   → Complete external integrations setup')
}

console.log('   → Add comprehensive logging')
console.log('   → Implement rate limiting on APIs')
console.log('   → Add API documentation')
console.log('   → Set up monitoring & alerts')

// PROFESSIONAL SCORE
const goodAPIs = audit.apis.filter(a => a.status === 'GOOD').length
const totalAPIs = audit.apis.length
const apiScore = totalAPIs > 0 ? (goodAPIs / totalAPIs) * 100 : 0

const goodServices = audit.services.filter(s => s.status === 'GOOD').length
const totalServices = audit.services.length
const serviceScore = totalServices > 0 ? (goodServices / totalServices) * 100 : 0

const overallScore = (apiScore + serviceScore) / 2

console.log('\n' + '='.repeat(80))
console.log('🎯 PROFESSIONAL GRADE')
console.log('='.repeat(80) + '\n')

console.log(`API Quality: ${apiScore.toFixed(1)}%`)
console.log(`Service Quality: ${serviceScore.toFixed(1)}%`)
console.log(`Overall Score: ${overallScore.toFixed(1)}%`)

if (overallScore >= 90) {
  console.log('\n✅ EXCELLENT - Production Ready!')
} else if (overallScore >= 75) {
  console.log('\n✅ GOOD - Minor improvements needed')
} else if (overallScore >= 60) {
  console.log('\n⚠️  FAIR - Some work required')
} else {
  console.log('\n❌ NEEDS WORK - Significant improvements needed')
}

console.log('\n' + '='.repeat(80))
console.log('✅ AUDIT COMPLETE')
console.log('='.repeat(80) + '\n')

// Save report
const report = {
  timestamp: new Date().toISOString(),
  apis: audit.apis,
  services: audit.services,
  dashboards: audit.dashboards,
  revenueStreams: audit.revenueStreams,
  integrations: audit.integrations,
  issues: audit.issues,
  scores: {
    api: apiScore,
    service: serviceScore,
    overall: overallScore
  }
}

fs.writeFileSync(
  path.join(__dirname, 'system-audit-report.json'),
  JSON.stringify(report, null, 2)
)

console.log('📄 Report saved to: system-audit-report.json\n')
