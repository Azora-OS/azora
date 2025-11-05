/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * COLD CHAIN MANAGEMENT SERVICE
 *
 * Complete supply chain temperature and condition monitoring to prevent waste
 * and ensure product quality from production to consumption.
 *
 * Features:
 * - Real-time temperature and humidity monitoring
 * - Predictive alerts for potential spoilage
 * - Automated quality assurance
 * - Waste prevention through proactive interventions
 * - Integration with GPS for location-based optimization
 */

import { ColdChainData, ColdChainAlert, GPSCoordinate } from './ambient-intelligence'
import { elaraGPSInsights } from './elara-gps-insights'

export interface ColdChainConfig {
  productType: string
  optimalTempRange: {
    min: number
    max: number
  }
  optimalHumidityRange?: {
    min: number
    max: number
  }
  maxTransitTime: number // hours
  criticalThreshold: number // percentage deviation before alert
  monitoringInterval: number // minutes
}

export interface SupplyChainNode {
  id: string
  type: 'farm' | 'processing' | 'warehouse' | 'transport' | 'retail' | 'consumer'
  location: GPSCoordinate
  name: string
  capacity: number
  currentLoad: number
}

export class ColdChainManagementService {
  private monitoredChains: Map<string, ColdChainData[]> = new Map()
  private activeAlerts: ColdChainAlert[] = []
  private productConfigs: Map<string, ColdChainConfig> = new Map()
  private supplyChainNodes: SupplyChainNode[] = []

  constructor() {
    this.initializeProductConfigs()
    this.initializeSupplyChainNodes()
  }

  /**
   * Initialize standard product configurations
   */
  private initializeProductConfigs(): void {
    // Vaccines
    this.productConfigs.set('vaccines', {
      productType: 'vaccines',
      optimalTempRange: { min: 2, max: 8 },
      optimalHumidityRange: { min: 35, max: 75 },
      maxTransitTime: 48,
      criticalThreshold: 10,
      monitoringInterval: 5
    })

    // Fresh Produce
    this.productConfigs.set('fresh_produce', {
      productType: 'fresh_produce',
      optimalTempRange: { min: 4, max: 7 },
      optimalHumidityRange: { min: 85, max: 95 },
      maxTransitTime: 72,
      criticalThreshold: 15,
      monitoringInterval: 15
    })

    // Dairy Products
    this.productConfigs.set('dairy', {
      productType: 'dairy',
      optimalTempRange: { min: 2, max: 6 },
      optimalHumidityRange: { min: 80, max: 90 },
      maxTransitTime: 96,
      criticalThreshold: 12,
      monitoringInterval: 10
    })

    // Meat & Poultry
    this.productConfigs.set('meat_poultry', {
      productType: 'meat_poultry',
      optimalTempRange: { min: -1, max: 4 },
      optimalHumidityRange: { min: 85, max: 90 },
      maxTransitTime: 48,
      criticalThreshold: 8,
      monitoringInterval: 5
    })

    // Pharmaceuticals
    this.productConfigs.set('pharmaceuticals', {
      productType: 'pharmaceuticals',
      optimalTempRange: { min: 15, max: 25 },
      optimalHumidityRange: { min: 40, max: 60 },
      maxTransitTime: 168, // 1 week
      criticalThreshold: 5,
      monitoringInterval: 30
    })
  }

  /**
   * Initialize supply chain nodes
   */
  private initializeSupplyChainNodes(): void {
    this.supplyChainNodes = [
      {
        id: 'farm_001',
        type: 'farm',
        location: { latitude: -26.1500, longitude: 28.1000 },
        name: 'Green Valley Farm',
        capacity: 10000,
        currentLoad: 7500
      },
      {
        id: 'processing_001',
        type: 'processing',
        location: { latitude: -26.1800, longitude: 28.0800 },
        name: 'Fresh Process Co.',
        capacity: 5000,
        currentLoad: 3200
      },
      {
        id: 'warehouse_001',
        type: 'warehouse',
        location: { latitude: -26.2000, longitude: 28.0500 },
        name: 'Cold Storage Hub',
        capacity: 25000,
        currentLoad: 18000
      },
      {
        id: 'retail_001',
        type: 'retail',
        location: { latitude: -26.2041, longitude: 28.0473 },
        name: 'FreshMart Downtown',
        capacity: 1000,
        currentLoad: 650
      }
    ]
  }

  /**
   * Start monitoring a cold chain shipment
   */
  async startChainMonitoring(
    batchId: string,
    productType: string,
    initialLocation: GPSCoordinate,
    destination: GPSCoordinate
  ): Promise<string> {
    const config = this.productConfigs.get(productType)
    if (!config) {
      throw new Error(`Unknown product type: ${productType}`)
    }

    const chainData: ColdChainData = {
      temperature: config.optimalTempRange.min + 2, // Start in optimal range
      humidity: config.optimalHumidityRange ? (config.optimalHumidityRange.min + 5) : 50,
      location: initialLocation,
      timestamp: Date.now(),
      product: productType,
      batchId,
      optimalRange: {
        minTemp: config.optimalTempRange.min,
        maxTemp: config.optimalTempRange.max,
        maxHumidity: config.optimalHumidityRange?.max || 100
      },
      alerts: []
    }

    if (!this.monitoredChains.has(batchId)) {
      this.monitoredChains.set(batchId, [])
    }

    this.monitoredChains.get(batchId)!.push(chainData)

    // Start monitoring loop
    this.startMonitoringLoop(batchId, config)

    console.log(`✅ Started cold chain monitoring for ${productType} batch ${batchId}`)
    return batchId
  }

  /**
   * Record temperature/humidity reading
   */
  async recordReading(
    batchId: string,
    temperature: number,
    humidity: number,
    location: GPSCoordinate
  ): Promise<ColdChainAlert[]> {
    const chainData = this.monitoredChains.get(batchId)
    if (!chainData || chainData.length === 0) {
      throw new Error(`No active monitoring for batch ${batchId}`)
    }

    const config = this.productConfigs.get(chainData[0].product)
    if (!config) return []

    const reading: ColdChainData = {
      temperature,
      humidity,
      location,
      timestamp: Date.now(),
      product: chainData[0].product,
      batchId,
      optimalRange: chainData[0].optimalRange,
      alerts: []
    }

    // Check for temperature violations
    const tempDeviation = Math.abs(temperature - (config.optimalTempRange.min + config.optimalTempRange.max) / 2) /
                         ((config.optimalTempRange.max - config.optimalTempRange.min) / 2)

    if (tempDeviation > config.criticalThreshold / 100) {
      const alert: ColdChainAlert = {
        type: 'temperature',
        severity: temperature < config.optimalTempRange.min || temperature > config.optimalTempRange.max ? 'critical' : 'warning',
        message: `Temperature ${temperature}°C is outside optimal range (${config.optimalTempRange.min}°C - ${config.optimalTempRange.max}°C)`,
        timestamp: Date.now()
      }
      reading.alerts.push(alert)
      this.activeAlerts.push(alert)
    }

    // Check for humidity violations
    if (config.optimalHumidityRange) {
      const humidityDeviation = Math.abs(humidity - (config.optimalHumidityRange.min + config.optimalHumidityRange.max) / 2) /
                               ((config.optimalHumidityRange.max - config.optimalHumidityRange.min) / 2)

      if (humidityDeviation > config.criticalThreshold / 100) {
        const alert: ColdChainAlert = {
          type: 'humidity',
          severity: humidity < config.optimalHumidityRange.min || humidity > config.optimalHumidityRange.max ? 'critical' : 'warning',
          message: `Humidity ${humidity}% is outside optimal range (${config.optimalHumidityRange.min}% - ${config.optimalHumidityRange.max}%)`,
          timestamp: Date.now()
        }
        reading.alerts.push(alert)
        this.activeAlerts.push(alert)
      }
    }

    chainData.push(reading)

    // Trigger interventions if needed
    if (reading.alerts.length > 0) {
      await this.triggerInterventions(batchId, reading.alerts, location)
    }

    return reading.alerts
  }

  /**
   * Start automated monitoring loop
   */
  private startMonitoringLoop(batchId: string, config: ColdChainConfig): void {
    const interval = setInterval(async () => {
      const chainData = this.monitoredChains.get(batchId)
      if (!chainData || chainData.length === 0) {
        clearInterval(interval)
        return
      }

      const lastReading = chainData[chainData.length - 1]

      // Simulate sensor readings (in real implementation, this would come from IoT sensors)
      const simulatedTemp = lastReading.temperature + (Math.random() - 0.5) * 2
      const simulatedHumidity = Math.max(0, Math.min(100, lastReading.humidity + (Math.random() - 0.5) * 5))

      // Add slight GPS movement simulation
      const newLocation = {
        latitude: lastReading.location.latitude + (Math.random() - 0.5) * 0.001,
        longitude: lastReading.location.longitude + (Math.random() - 0.5) * 0.001
      }

      await this.recordReading(batchId, simulatedTemp, simulatedHumidity, newLocation)
    }, config.monitoringInterval * 60 * 1000) // Convert minutes to milliseconds
  }

  /**
   * Trigger interventions for alerts
   */
  private async triggerInterventions(
    batchId: string,
    alerts: ColdChainAlert[],
    location: GPSCoordinate
  ): Promise<void> {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical')

    if (criticalAlerts.length > 0) {
      console.log(`🚨 CRITICAL ALERT for batch ${batchId}:`)
      criticalAlerts.forEach(alert => console.log(`   ${alert.message}`))

      // Get GPS insights for rerouting if needed
      const gpsInsights = await elaraGPSInsights.getGPSInsights(location)

      // Trigger emergency protocols
      await this.emergencyIntervention(batchId, alerts, location)
    }
  }

  /**
   * Emergency intervention for critical cold chain failures
   */
  private async emergencyIntervention(
    batchId: string,
    alerts: ColdChainAlert[],
    location: GPSCoordinate
  ): Promise<void> {
    // Find nearest cold storage facility
    const nearestFacility = this.findNearestFacility(location, 'warehouse')

    if (nearestFacility) {
      console.log(`🏭 Emergency rerouting batch ${batchId} to ${nearestFacility.name}`)

      // Use GPS insights to get optimal emergency route
      const emergencyRoute = await elaraGPSInsights.getGPSInsights(location, nearestFacility.location)

      // In real implementation, this would:
      // 1. Alert transportation provider
      // 2. Coordinate emergency pickup
      // 3. Notify supply chain partners
      // 4. Update insurance systems
    }

    // Notify stakeholders
    await this.notifyStakeholders(batchId, alerts)
  }

  /**
   * Find nearest facility of specified type
   */
  private findNearestFacility(location: GPSCoordinate, type: SupplyChainNode['type']): SupplyChainNode | null {
    const facilities = this.supplyChainNodes.filter(node => node.type === type)

    let nearest: SupplyChainNode | null = null
    let minDistance = Infinity

    for (const facility of facilities) {
      const distance = this.calculateDistance(location, facility.location)
      if (distance < minDistance && facility.currentLoad < facility.capacity * 0.9) { // Has capacity
        minDistance = distance
        nearest = facility
      }
    }

    return nearest
  }

  /**
   * Get comprehensive cold chain analytics
   */
  async getChainAnalytics(batchId: string): Promise<any> {
    const chainData = this.monitoredChains.get(batchId)
    if (!chainData || chainData.length === 0) {
      throw new Error(`No data found for batch ${batchId}`)
    }

    const totalAlerts = chainData.reduce((sum, reading) => sum + reading.alerts.length, 0)
    const criticalAlerts = chainData.reduce((sum, reading) =>
      sum + reading.alerts.filter(a => a.severity === 'critical').length, 0
    )

    const tempReadings = chainData.map(r => r.temperature)
    const avgTemp = tempReadings.reduce((a, b) => a + b, 0) / tempReadings.length

    return {
      batchId,
      product: chainData[0].product,
      monitoringDuration: chainData[chainData.length - 1].timestamp - chainData[0].timestamp,
      totalReadings: chainData.length,
      alerts: {
        total: totalAlerts,
        critical: criticalAlerts,
        warning: totalAlerts - criticalAlerts
      },
      temperature: {
        average: avgTemp,
        min: Math.min(...tempReadings),
        max: Math.max(...tempReadings),
        optimal: chainData[0].optimalRange
      },
      quality: {
        score: Math.max(0, 100 - (totalAlerts * 5)), // Quality score based on alerts
        status: criticalAlerts > 0 ? 'compromised' : totalAlerts > 0 ? 'acceptable' : 'excellent'
      },
      locations: chainData.map(r => r.location),
      recommendations: await this.generateRecommendations(batchId)
    }
  }

  /**
   * Generate improvement recommendations
   */
  private async generateRecommendations(batchId: string): Promise<string[]> {
    const analytics = await this.getChainAnalytics(batchId)
    const recommendations: string[] = []

    if (analytics.alerts.critical > 0) {
      recommendations.push('Implement redundant cooling systems for critical shipments')
    }

    if (analytics.temperature.average > analytics.temperature.optimal.maxTemp) {
      recommendations.push('Upgrade transportation vehicles with better insulation')
    }

    if (analytics.alerts.total > analytics.monitoringDuration / (24 * 60 * 60 * 1000) * 5) {
      recommendations.push('Review supplier quality control processes')
    }

    recommendations.push('Consider predictive maintenance scheduling based on historical data')
    recommendations.push('Implement real-time GPS tracking for all shipments')

    return recommendations
  }

  /**
   * Notify stakeholders of issues
   */
  private async notifyStakeholders(batchId: string, alerts: ColdChainAlert[]): Promise<void> {
    // In real implementation, this would send notifications via:
    // - Email to supply chain managers
    // - SMS to transportation providers
    // - Push notifications to mobile apps
    // - Integration with ERP systems

    console.log(`📧 Notifying stakeholders about ${alerts.length} alerts for batch ${batchId}`)
  }

  /**
   * Calculate distance between two GPS coordinates
   */
  private calculateDistance(coord1: GPSCoordinate, coord2: GPSCoordinate): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.latitude - coord1.latitude)
    const dLon = this.toRadians(coord2.longitude - coord1.longitude)

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(coord1.latitude)) * Math.cos(this.toRadians(coord2.latitude)) *
              Math.sin(dLon/2) * Math.sin(dLon/2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * End monitoring for a batch
   */
  async endChainMonitoring(batchId: string): Promise<any> {
    const analytics = await this.getChainAnalytics(batchId)
    this.monitoredChains.delete(batchId)
    console.log(`✅ Ended cold chain monitoring for batch ${batchId}`)
    return analytics
  }

  /**
   * Get all active monitored chains
   */
  getActiveChains(): string[] {
    return Array.from(this.monitoredChains.keys())
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): ColdChainAlert[] {
    return this.activeAlerts.filter(alert =>
      Date.now() - alert.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    )
  }
}

// Export singleton instance
export const coldChainManagement = new ColdChainManagementService()
