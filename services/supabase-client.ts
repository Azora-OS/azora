/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * SUPABASE CLIENT - Production Backend
 * 
 * Battle-tested, open-source Firebase alternative
 * Gives us: Auth, Database, Storage, Realtime - instantly
 */

import { createClient } from '@supabase/supabase-js'

// Configuration from environment
const supabaseUrl = process.env.SUPABASE_URL || 'https://mpqlpqegrzxklljwrzpe.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcWxwcWVncnp4a2xsandyenBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDczNTEsImV4cCI6MjA3NzMyMzM1MX0.Lc0VCbuCpA7JkeLepAyoN1g0UO-qo0_iNPmiMVOS32Y'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database schemas for Azora
export type UserType = 'student' | 'teacher' | 'parent' | 'admin' | 'founder' | 'partner'

export interface User {
  id: string
  name: string
  email: string
  user_type: UserType
  wallet_address?: string
  total_earned: number
  country: string
  language: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// Legacy alias for backwards compatibility
export type Student = User

export interface ProofOfKnowledge {
  id: string
  user_id: string
  module_id: string
  score: number
  reward_amount: number
  proof_hash: string
  verified: boolean
  created_at: string
}

export interface Device {
  id: string
  user_id: string
  device_type: string
  model: string
  serial_number: string
  status: 'active' | 'locked' | 'stolen' | 'recovered'
  last_latitude?: number
  last_longitude?: number
  last_seen: string
  created_at: string
}

/**
 * User Operations (All Types)
 */
export const UserDB = {
  async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) throw error
    return data
  },

  async getByType(userType: UserType) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_type', userType)
    
    if (error) throw error
    return data
  },

  async updateEarnings(id: string, amount: number) {
    const { data, error } = await supabase
      .from('users')
      .update({ total_earned: amount })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateMetadata(id: string, metadata: Record<string, any>) {
    const { data, error } = await supabase
      .from('users')
      .update({ metadata })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Legacy alias for backwards compatibility
export const StudentDB = {
  async create(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) {
    return UserDB.create({ ...student, user_type: 'student' })
  },
  getById: UserDB.getById,
  getByEmail: UserDB.getByEmail,
  updateEarnings: UserDB.updateEarnings
}

/**
 * Proof-of-Knowledge Operations
 */
export const ProofDB = {
  async create(proof: Omit<ProofOfKnowledge, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('proofs')
      .insert([proof])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('proofs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getTotalRewards(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('proofs')
      .select('reward_amount')
      .eq('user_id', userId)
      .eq('verified', true)
    
    if (error) throw error
    return data.reduce((sum, proof) => sum + proof.reward_amount, 0)
  },

  // Legacy alias
  async getByStudent(studentId: string) {
    return this.getByUser(studentId)
  }
}

/**
 * Device Security Operations
 */
export const DeviceDB = {
  async register(device: Omit<Device, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('devices')
      .insert([device])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateLocation(id: string, latitude: number, longitude: number) {
    const { data, error } = await supabase
      .from('devices')
      .update({ 
        last_latitude: latitude,
        last_longitude: longitude,
        last_seen: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: Device['status']) {
    const { data, error } = await supabase
      .from('devices')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  }
}

/**
 * Realtime subscriptions for live updates
 */
export const RealtimeChannels = {
  subscribeToProofs(callback: (proof: ProofOfKnowledge) => void) {
    return supabase
      .channel('proofs')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'proofs' },
        payload => callback(payload.new as ProofOfKnowledge)
      )
      .subscribe()
  },

  subscribeToDeviceUpdates(userId: string, callback: (device: Device) => void) {
    return supabase
      .channel(`devices:${userId}`)
      .on('postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'devices',
          filter: `user_id=eq.${userId}`
        },
        payload => callback(payload.new as Device)
      )
      .subscribe()
  }
}

console.log('✨ Supabase client initialized')
console.log(`   URL: ${supabaseUrl}`)
console.log('   Features: Auth, Database, Storage, Realtime')
console.log('   Status: Production-ready\n')

export default supabase
