#!/usr/bin/env node
/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AZORA OS STATUS CHECKER
Quick status check for Azora OS transformation
*/

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('\n🌟 AZORA OS STATUS CHECK\n')
console.log('=' .repeat(50))

try {
    // Check running processes
    console.log('🔍 Checking running processes...\n')

    const processes = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', { encoding: 'utf8' })
        .split('\n')
        .filter(line => line.includes('node.exe'))
        .map(line => {
            const parts = line.split(',')
            return {
                name: parts[0].replace(/"/g, ''),
                pid: parts[1].replace(/"/g, ''),
                memory: parts[4].replace(/"/g, '')
            }
        })

    if (processes.length > 0) {
        console.log(`✅ Found ${processes.length} Node.js processes:`)
        processes.forEach(proc => {
            console.log(`   • PID ${proc.pid}: ${proc.memory} memory`)
        })
    } else {
        console.log('❌ No Node.js processes found')
    }

    console.log('\n🔍 Checking Azora services...\n')

    // Check common Azora ports
    const ports = [3006, 4000, 4099, 4200, 4300, 12345]
    let runningServices = 0

    for (const port of ports) {
        try {
            execSync(`netstat -an | find "LISTENING" | find ":${port} "`, { stdio: 'pipe' })
            console.log(`✅ Port ${port} is listening`)
            runningServices++
        } catch {
            console.log(`❌ Port ${port} is not listening`)
        }
    }

    console.log(`\n📊 Status Summary:`)
    console.log(`   • Node processes: ${processes.length}`)
    console.log(`   • Services online: ${runningServices}/${ports.length}`)
    console.log(`   • Azora OS: ${runningServices > 0 ? 'RUNNING' : 'STOPPED'}`)

    if (runningServices > 0) {
        console.log('\n🎉 Azora OS is ACTIVE!')
        console.log('💡 Try saying "Hey Elara" to interact with your AI assistant')
    } else {
        console.log('\n⚠️ Azora OS may not be fully operational')
        console.log('💡 Run: npx tsx transform-windows-to-azora.ts')
    }

} catch (error) {
    console.error('❌ Status check failed:', error.message)
}

console.log('\n=' .repeat(50) + '\n')
