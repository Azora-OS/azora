/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * DEVICE SECURITY & TRACKING SYSTEM
 * 
 * Anti-theft protection for African users
 * Live GPS tracking, remote lock, device recovery
 */

import { EventEmitter } from 'events'
import crypto from 'crypto'

export interface Device {
  id: string
  userId: string
  type: 'smartphone' | 'tablet' | 'laptop' | 'desktop'
  model: string
  imei?: string
  serialNumber: string
  status: 'active' | 'locked' | 'stolen' | 'recovered'
  lastSeen: Date
  location?: GeolocationData
  registeredAt: Date
}

export interface GeolocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: Date
  address?: string
  city?: string
  country: string
}

export interface SecurityAction {
  id: string
  deviceId: string
  action: 'lock' | 'wipe' | 'alarm' | 'track' | 'recover'
  initiatedBy: string
  timestamp: Date
  success: boolean
  location?: GeolocationData
}

export class DeviceSecurityTracker extends EventEmitter {
  private devices: Map<string, Device> = new Map()
  private actions: SecurityAction[] = []
  private trackingInterval?: NodeJS.Timeout

  constructor() {
    super()
    console.log('🔒 Device Security & Tracking System initialized')
  }

  /**
   * Register a new device
   */
  registerDevice(
    userId: string,
    type: Device['type'],
    model: string,
    serialNumber: string,
    imei?: string
  ): Device {
    const deviceId = crypto.randomUUID()
    
    const device: Device = {
      id: deviceId,
      userId,
      type,
      model,
      serialNumber,
      imei,
      status: 'active',
      lastSeen: new Date(),
      registeredAt: new Date()
    }

    this.devices.set(deviceId, device)
    
    console.log(`✅ Device registered: ${model} (${type})`)
    console.log(`   User: ${userId}`)
    console.log(`   Serial: ${serialNumber}`)
    
    this.emit('device-registered', device)
    return device
  }

  /**
   * Update device location (simulated GPS)
   */
  updateLocation(deviceId: string, lat: number, lng: number, country: string = 'South Africa'): void {
    const device = this.devices.get(deviceId)
    if (!device) return

    device.location = {
      latitude: lat,
      longitude: lng,
      accuracy: Math.random() * 10 + 5, // 5-15m accuracy
      timestamp: new Date(),
      country
    }
    device.lastSeen = new Date()

    this.emit('location-updated', device)
  }

  /**
   * Remote lock device (anti-theft)
   */
  async remoteLock(deviceId: string, userId: string): Promise<SecurityAction> {
    const device = this.devices.get(deviceId)
    if (!device) throw new Error('Device not found')
    if (device.userId !== userId) throw new Error('Unauthorized')

    device.status = 'locked'
    
    const action: SecurityAction = {
      id: crypto.randomUUID(),
      deviceId,
      action: 'lock',
      initiatedBy: userId,
      timestamp: new Date(),
      success: true,
      location: device.location
    }

    this.actions.push(action)
    
    console.log(`🔒 DEVICE LOCKED: ${device.model}`)
    console.log(`   Location: ${device.location?.latitude}, ${device.location?.longitude}`)
    
    this.emit('device-locked', action)
    return action
  }

  /**
   * Trigger loud alarm on device
   */
  async triggerAlarm(deviceId: string, userId: string): Promise<SecurityAction> {
    const device = this.devices.get(deviceId)
    if (!device) throw new Error('Device not found')
    if (device.userId !== userId) throw new Error('Unauthorized')

    const action: SecurityAction = {
      id: crypto.randomUUID(),
      deviceId,
      action: 'alarm',
      initiatedBy: userId,
      timestamp: new Date(),
      success: true,
      location: device.location
    }

    this.actions.push(action)
    
    console.log(`🚨 ALARM TRIGGERED: ${device.model}`)
    console.log(`   This helps locate stolen devices in crowded areas`)
    
    this.emit('alarm-triggered', action)
    return action
  }

  /**
   * Track device in real-time
   */
  startTracking(deviceId: string): void {
    const device = this.devices.get(deviceId)
    if (!device) return

    console.log(`📍 Real-time tracking started for ${device.model}`)
    
    // Simulate GPS updates every 30 seconds
    this.trackingInterval = setInterval(() => {
      // Simulate device movement (small random changes)
      const currentLat = device.location?.latitude || -26.2041 // Johannesburg
      const currentLng = device.location?.longitude || 28.0473
      
      const newLat = currentLat + (Math.random() - 0.5) * 0.001
      const newLng = currentLng + (Math.random() - 0.5) * 0.001
      
      this.updateLocation(deviceId, newLat, newLng)
      
      console.log(`📍 Location update: ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`)
    }, 30000)
  }

  /**
   * Report device as stolen
   */
  reportStolen(deviceId: string, userId: string): void {
    const device = this.devices.get(deviceId)
    if (!device) return
    if (device.userId !== userId) throw new Error('Unauthorized')

    device.status = 'stolen'
    
    // Auto-lock and start tracking
    this.remoteLock(deviceId, userId)
    this.startTracking(deviceId)
    
    console.log(`⚠️  DEVICE REPORTED STOLEN: ${device.model}`)
    console.log(`   Auto-locked and tracking enabled`)
    console.log(`   Police can be notified with location data`)
    
    this.emit('device-stolen', device)
  }

  /**
   * Mark device as recovered
   */
  markRecovered(deviceId: string, userId: string): void {
    const device = this.devices.get(deviceId)
    if (!device) return

    device.status = 'recovered'
    
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval)
    }

    console.log(`✅ DEVICE RECOVERED: ${device.model}`)
    this.emit('device-recovered', device)
  }

  /**
   * Get all devices for a user
   */
  getUserDevices(userId: string): Device[] {
    return Array.from(this.devices.values())
      .filter(d => d.userId === userId)
  }

  /**
   * Get device location history
   */
  getLocationHistory(deviceId: string): SecurityAction[] {
    return this.actions
      .filter(a => a.deviceId === deviceId && a.location)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Get security statistics
   */
  getStats() {
    const devices = Array.from(this.devices.values())
    
    return {
      totalDevices: devices.length,
      active: devices.filter(d => d.status === 'active').length,
      locked: devices.filter(d => d.status === 'locked').length,
      stolen: devices.filter(d => d.status === 'stolen').length,
      recovered: devices.filter(d => d.status === 'recovered').length,
      totalActions: this.actions.length,
      recentActions: this.actions.slice(-10)
    }
  }
}

export const deviceSecurity = new DeviceSecurityTracker()
export default deviceSecurity
