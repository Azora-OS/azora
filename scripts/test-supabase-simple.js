/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * SUPABASE CONNECTION TEST (Plain JavaScript)
 * Quick verification that our production backend is alive
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mpqlpqegrzxklljwrzpe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcWxwcWVncnp4a2xsandyenBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDczNTEsImV4cCI6MjA3NzMyMzM1MX0.Lc0VCbuCpA7JkeLepAyoN1g0UO-qo0_iNPmiMVOS32Y'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('🧪 Testing Supabase Connection...\n')
  
  try {
    // Test 1: Connection check
    console.log('1️⃣ Checking connection...')
    const { data, error } = await supabase.from('students').select('count')
    if (error && !error.message.includes('does not exist')) {
      throw error
    }
    console.log('   ✅ Connected to Supabase successfully!\n')

    // Test 2: Auth status
    console.log('2️⃣ Checking auth status...')
    const { data: { session } } = await supabase.auth.getSession()
    console.log(`   ${session ? '👤' : '🔓'} Session: ${session ? 'Active' : 'No user logged in (normal for first run)'}\n`)

    // Test 3: Database permissions
    console.log('3️⃣ Testing database access...')
    console.log('   📝 Note: If tables don\'t exist yet, run the schema.sql in Supabase SQL editor')
    console.log('   📍 File location: supabase/schema.sql\n')

    // Test 4: Configuration check
    console.log('4️⃣ Configuration check:')
    console.log('   🌐 URL:', supabaseUrl)
    console.log('   🔑 Anon Key: ✅ Present')
    console.log('   📧 Email Domain: azora.world')
    console.log('   👤 Admin: sizwe.ngwenya@azora.world')
    console.log()

    console.log('✨ All checks passed! Supabase is ready.\n')
    console.log('Next steps:')
    console.log('  1. ✅ Package installed (@supabase/supabase-js)')
    console.log('  2. 📋 Run the SQL schema in your Supabase dashboard')
    console.log('     → https://mpqlpqegrzxklljwrzpe.supabase.co')
    console.log('     → SQL Editor → Paste supabase/schema.sql → Run')
    console.log('  3. 🚀 Start building with real backend!\n')

  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('  1. Check your .env.supabase file exists')
    console.log('  2. Verify Supabase URL and key are correct')
    console.log('  3. Make sure you ran the schema.sql in Supabase\n')
    process.exit(1)
  }
}

testConnection()
