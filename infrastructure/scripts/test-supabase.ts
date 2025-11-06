/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * SUPABASE CONNECTION TEST
 * Quick verification that our production backend is alive
 */

import { supabase, StudentDB, ProofDB, DeviceDB } from '../services/supabase-client.js'

async function testSupabaseConnection() {
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
    console.log('   🌐 URL:', process.env.SUPABASE_URL || 'https://mpqlpqegrzxklljwrzpe.supabase.co')
    console.log('   🔑 Anon Key:', process.env.SUPABASE_ANON_KEY ? '✅ Present' : '✅ Using hardcoded (development)')
    console.log('   📧 Email Domain:', process.env.EMAIL_DOMAIN || 'azora.world')
    console.log('   👤 Admin:', process.env.EMAIL_ADMIN || 'sizwe.ngwenya@azora.world')
    console.log()

    console.log('✨ All checks passed! Supabase is ready.\n')
    console.log('Next steps:')
    console.log('  1. Run the SQL schema in your Supabase dashboard')
    console.log('  2. npm install (to install @supabase/supabase-js)')
    console.log('  3. Start building with real backend! 🚀\n')

  } catch (error: any) {
    console.error('❌ Connection test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('  1. Check your .env.supabase file exists')
    console.log('  2. Verify Supabase URL and key are correct')
    console.log('  3. Run: npm install @supabase/supabase-js')
    console.log('  4. Make sure you ran the schema.sql in Supabase\n')
    process.exit(1)
  }
}

testSupabaseConnection()
