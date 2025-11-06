/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { EventEmitter } from 'events';
import type {
  Shipment,
  TemperatureSensor,
  SensorReading,
  TemperatureExcursion,
  ShipmentAlert,
  TemperatureLogEntry
} from '../interfaces';

/**
 * MONITORING ENGINE
 * 
 * Real-time cold chain monitoring with:
 * - Continuous temperature tracking
 * - Automated alert generation
 * - Excursion detection and analysis
 * - Compliance monitoring
 */
export class MonitoringEngine extends EventEmitter {
  private activeMonitoring: Map<string, MonitoringSession> = new Map();
  private excursions: Map<string, TemperatureExcursion> = new Map();

  constructor() {
    super();
    this.startMonitoringLoop();
  }

  /**
   * Start monitoring a shipment
   */
  async startShipmentMonitoring(shipment: Shipment): Promise<void> {
    const session = new MonitoringSession(shipment, this);
    this.activeMonitoring.set(shipment.id, session);
    
    await session.start();
    
    this.emit('monitoringStarted', { shipmentId: shipment.id });
  }

  /**
   * Process sensor reading
   */
  async processSensorReading(
    shipmentId: string,
    sensorId: string,
    reading: SensorReading
  ): Promise<void> {
    const session = this.activeMonitoring.get(shipmentId);
    if (!session) {
      console.warn(`No active monitoring session for shipment ${shipmentId}`);
      return;
    }

    await session.processReading(sensorId, reading);
  }

  /**
   * Check for temperature excursions
   */
  async checkExcursion(
    shipmentId: string,
    temperature: number,
    requiredRange: { min: number; max: number },
    location?: { latitude: number; longitude: number }
  ): Promise<TemperatureExcursion | null> {
    if (temperature >= requiredRange.min && temperature <= requiredRange.max) {
      // Temperature within range - close any open excursion
      const openExcursion = this.findOpenExcursion(shipmentId);
      if (openExcursion) {
        await this.closeExcursion(openExcursion.id);
      }
      return null;
    }

    // Temperature out of range
    const openExcursion = this.findOpenExcursion(shipmentId);
    if (openExcursion) {
      // Update existing excursion
      openExcursion.duration = Date.now() - openExcursion.start.getTime();
      openExcursion.maxTemp = Math.max(openExcursion.maxTemp, temperature);
      openExcursion.minTemp = Math.min(openExcursion.minTemp, temperature);
      
      return openExcursion;
    }

    // Create new excursion
    const excursion: TemperatureExcursion = {
      id: `exc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      start: new Date(),
      duration: 0,
      minTemp: temperature,
      maxTemp: temperature,
      averageTemp: temperature,
      requiredRange,
      severity: this.calculateSeverity(temperature, requiredRange),
      impact: 'none',
      location
    };

    this.excursions.set(excursion.id, excursion);
    this.emit('excursionDetected', { shipmentId, excursion });

    return excursion;
  }

  /**
   * Generate alert
   */
  async generateAlert(shipmentId: string, alert: Omit<ShipmentAlert, 'id' | 'timestamp'>): Promise<ShipmentAlert> {
    const fullAlert: ShipmentAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...alert
    };

    this.emit('alertGenerated', { shipmentId, alert: fullAlert });

    // Escalate critical alerts
    if (fullAlert.severity === 'critical') {
      await this.escalateAlert(shipmentId, fullAlert);
    }

    return fullAlert;
  }

  /**
   * Get shipment monitoring status
   */
  async getMonitoringStatus(shipmentId: string): Promise<{
    isMonitoring: boolean;
    currentTemperature?: number;
    currentLocation?: { latitude: number; longitude: number };
    activeAlerts: number;
    temperatureLog: TemperatureLogEntry[];
    compliancePercentage: number;
  } | null> {
    const session = this.activeMonitoring.get(shipmentId);
    if (!session) return null;

    return session.getStatus();
  }

  // Private methods

  private findOpenExcursion(shipmentId: string): TemperatureExcursion | null {
    for (const excursion of this.excursions.values()) {
      if (!excursion.end && excursion.id.includes(shipmentId)) {
        return excursion;
      }
    }
    return null;
  }

  private async closeExcursion(excursionId: string): Promise<void> {
    const excursion = this.excursions.get(excursionId);
    if (!excursion) return;

    excursion.end = new Date();
    excursion.duration = excursion.end.getTime() - excursion.start.getTime();
    
    // Assess impact
    excursion.impact = this.assessImpact(excursion);
    
    this.emit('excursionClosed', { excursion });
  }

  private calculateSeverity(
    temperature: number,
    requiredRange: { min: number; max: number }
  ): 'minor' | 'moderate' | 'severe' {
    const deviation = Math.max(
      requiredRange.min - temperature,
      temperature - requiredRange.max
    );

    if (deviation <= 2) return 'minor';
    if (deviation <= 5) return 'moderate';
    return 'severe';
  }

  private assessImpact(excursion: TemperatureExcursion): 'none' | 'quality_affected' | 'product_compromised' {
    if (excursion.duration < 30 * 60 * 1000 && excursion.severity === 'minor') {
      return 'none';
    }
    if (excursion.duration < 2 * 60 * 60 * 1000 && excursion.severity !== 'severe') {
      return 'quality_affected';
    }
    return 'product_compromised';
  }

  private async escalateAlert(shipmentId: string, alert: ShipmentAlert): Promise<void> {
    console.log(`🚨 CRITICAL ALERT for shipment ${shipmentId}:`, alert.message);
    // In production: send SMS, email, push notifications
    this.emit('criticalAlertEscalated', { shipmentId, alert });
  }

  private startMonitoringLoop(): void {
    setInterval(() => {
      // Check all active monitoring sessions
      for (const [shipmentId, session] of this.activeMonitoring.entries()) {
        session.performHealthCheck();
      }
    }, 60 * 1000); // Every minute
  }
}

/**
 * Monitoring session for a single shipment
 */
class MonitoringSession {
  private shipment: Shipment;
  private engine: MonitoringEngine;
  private temperatureLog: TemperatureLogEntry[] = [];
  private lastReading: SensorReading | null = null;
  private alerts: ShipmentAlert[] = [];

  constructor(shipment: Shipment, engine: MonitoringEngine) {
    this.shipment = shipment;
    this.engine = engine;
  }

  async start(): Promise<void> {
    console.log(`Started monitoring shipment ${this.shipment.id}`);
  }

  async processReading(sensorId: string, reading: SensorReading): Promise<void> {
    this.lastReading = reading;

    if (reading.temperature !== undefined) {
      // Log temperature
      const logEntry: TemperatureLogEntry = {
        timestamp: reading.timestamp,
        temperature: reading.temperature,
        humidity: reading.humidity || 0,
        location: {
          latitude: 0, // Would come from GPS
          longitude: 0
        },
        withinSpec: this.checkWithinSpec(reading.temperature)
      };

      this.temperatureLog.push(logEntry);

      // Check for excursions
      const requiredRange = this.getRequiredTemperatureRange();
      await this.engine.checkExcursion(
        this.shipment.id,
        reading.temperature,
        requiredRange
      );
    }
  }

  async performHealthCheck(): Promise<void> {
    if (!this.lastReading) return;

    const age = Date.now() - this.lastReading.timestamp.getTime();
    if (age > 10 * 60 * 1000) { // 10 minutes
      await this.engine.generateAlert(this.shipment.id, {
        shipmentId: this.shipment.id,
        type: 'temperature_excursion',
        severity: 'warning',
        message: 'No sensor readings received for 10 minutes'
      });
    }
  }

  async getStatus() {
    const complianceReadings = this.temperatureLog.filter(entry => entry.withinSpec).length;
    const compliancePercentage = this.temperatureLog.length > 0
      ? (complianceReadings / this.temperatureLog.length) * 100
      : 100;

    return {
      isMonitoring: true,
      currentTemperature: this.lastReading?.temperature,
      currentLocation: undefined,
      activeAlerts: this.alerts.filter(a => !a.actionTaken).length,
      temperatureLog: this.temperatureLog.slice(-100), // Last 100 readings
      compliancePercentage
    };
  }

  private checkWithinSpec(temperature: number): boolean {
    const range = this.getRequiredTemperatureRange();
    return temperature >= range.min && temperature <= range.max;
  }

  private getRequiredTemperatureRange(): { min: number; max: number } {
    // Get the strictest requirement from all products
    const products = this.shipment.products;
    if (products.length === 0) {
      return { min: 2, max: 8 }; // Default cold chain range
    }

    return {
      min: Math.max(...products.map(p => p.temperatureRequirement.min)),
      max: Math.min(...products.map(p => p.temperatureRequirement.max))
    };
  }
}

export const monitoringEngine = new MonitoringEngine();
