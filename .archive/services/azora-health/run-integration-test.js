#!/usr/bin/env node

/**
 * Simple test runner for Azora Advanced Systems
 * Bypasses npm workspace issues for testing
 */

const { spawn } = require('child_process')
const path = require('path')

async function runTest() {
  console.log('🚀 Running Azora Advanced Systems Integration Test...')

  const testFile = path.join(__dirname, 'advanced-systems-integration-test.ts')

  // Use tsx if available, otherwise ts-node
  const tsx = spawn('npx', ['tsx', testFile], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  })

  return new Promise((resolve, reject) => {
    tsx.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Test completed successfully')
        resolve()
      } else {
        console.log('❌ Test failed with exit code:', code)
        reject(new Error(`Test failed with exit code ${code}`))
      }
    })

    tsx.on('error', (error) => {
      console.log('❌ Failed to start test:', error.message)
      reject(error)
    })
  })
}

// Run the test
runTest()
  .then(() => {
    console.log('🎉 All tests passed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test execution failed:', error.message)
    process.exit(1)
  })