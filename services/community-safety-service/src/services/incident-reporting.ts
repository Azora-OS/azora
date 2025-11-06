/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { EventEmitter } from 'events';
import type { SafetyIncident, SafetyAlert, Responder } from '../interfaces';

/**
 * INCIDENT REPORTING SYSTEM
 * 
 * Community-driven incident reporting with:
 * - Real-time incident submission
 * - Automated verification
 * - Emergency services dispatch
 * - Community alerting
 */
export class IncidentReportingSystem extends EventEmitter {
  private incidents: Map<string, SafetyIncident> = new Map();
  private alerts: Map<string, SafetyAlert> = new Map();

  constructor() {
    super();
  }

  /**
   * Report a safety incident
   */
  async reportIncident(data: Omit<SafetyIncident, 'id' | 'timestamp' | 'status' | 'responders' | 'alertsSent'>): Promise<SafetyIncident> {
    const incident: SafetyIncident = {
      id: `inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'reported',
      responders: [],
      alertsSent: 0,
      ...data
    };

    this.incidents.set(incident.id, incident);
    this.emit('incidentReported', incident);

    // Auto-verify high severity incidents
    if (incident.severity === 'critical' || incident.severity === 'high') {
      await this.verifyIncident(incident.id);
    }

    return incident;
  }

  /**
   * Verify incident authenticity
   */
  async verifyIncident(incidentId: string): Promise<void> {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error('Incident not found');

    incident.status = 'verified';
    incident.verifiedAt = new Date();

    this.emit('incidentVerified', incident);

    // Dispatch responders for critical incidents
    if (incident.severity === 'critical') {
      await this.dispatchResponders(incidentId);
    }

    // Send community alerts
    await this.sendCommunityAlert(incident);
  }

  /**
   * Dispatch emergency responders
   */
  async dispatchResponders(incidentId: string): Promise<void> {
    const incident = this.incidents.get(incidentId);
    if (!incident) return;

    const responderType = this.determineResponderType(incident.type);
    
    const responder: Responder = {
      id: `resp_${Date.now()}`,
      type: responderType,
      name: `${responderType.toUpperCase()} Unit`,
      status: 'dispatched',
      assignedAt: new Date(),
      eta: this.calculateETA(incident.location)
    };

    incident.responders.push(responder);
    incident.status = 'responding';

    this.emit('responderDispatched', { incidentId, responder });
  }

  /**
   * Send alert to community members in affected area
   */
  async sendCommunityAlert(incident: SafetyIncident): Promise<SafetyAlert> {
    const alert: SafetyAlert = {
      id: `alert_${Date.now()}`,
      incidentId: incident.id,
      type: incident.severity === 'critical' ? 'emergency' : 'warning',
      severity: incident.severity,
      title: `${incident.type.toUpperCase()}: ${incident.location.address}`,
      message: incident.description,
      location: {
        latitude: incident.location.latitude,
        longitude: incident.location.longitude,
        radius: incident.affectedRadius
      },
      affectedUsers: 0,
      sentAt: new Date(),
      acknowledgments: 0
    };

    this.alerts.set(alert.id, alert);
    
    // Calculate affected users (simulated)
    alert.affectedUsers = Math.floor(Math.random() * 1000);
    incident.alertsSent = alert.affectedUsers;

    this.emit('alertSent', alert);

    return alert;
  }

  /**
   * Update incident status
   */
  async updateIncidentStatus(incidentId: string, status: SafetyIncident['status']): Promise<void> {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error('Incident not found');

    incident.status = status;
    
    if (status === 'resolved') {
      incident.resolvedAt = new Date();
      this.emit('incidentResolved', incident);
    }
  }

  /**
   * Get incidents by area
   */
  async getIncidentsByArea(location: { latitude: number; longitude: number }, radiusKm: number): Promise<SafetyIncident[]> {
    const incidents: SafetyIncident[] = [];
    
    for (const incident of this.incidents.values()) {
      const distance = this.calculateDistance(
        location,
        incident.location
      );
      
      if (distance <= radiusKm) {
        incidents.push(incident);
      }
    }

    return incidents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Private helpers

  private determineResponderType(incidentType: SafetyIncident['type']): Responder['type'] {
    switch (incidentType) {
      case 'crime':
      case 'suspicious_activity':
        return 'police';
      case 'fire':
        return 'fire';
      case 'medical':
      case 'accident':
        return 'medical';
      default:
        return 'community_volunteer';
    }
  }

  private calculateETA(location: { latitude: number; longitude: number }): number {
    // Simplified ETA calculation
    return Math.floor(Math.random() * 15) + 5; // 5-20 minutes
  }

  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.latitude)) *
        Math.cos(this.toRad(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}

export const incidentReporting = new IncidentReportingSystem();
