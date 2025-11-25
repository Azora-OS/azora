/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Incident {
  id: string;
  type: 'BREACH' | 'ATTACK' | 'ANOMALY' | 'VIOLATION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  affectedSystems: string[];
  status: 'DETECTED' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';
}

export class IncidentResponse {
  private activeIncidents: Map<string, Incident> = new Map();

  async detectIncident(type: Incident['type'], data: any) {
    const incident: Incident = {
      id: `INC-${Date.now()}`,
      type,
      severity: this.assessSeverity(type, data),
      description: this.generateDescription(type, data),
      affectedSystems: data.systems || [],
      status: 'DETECTED'
    };

    this.activeIncidents.set(incident.id, incident);

    await prisma.auditLog.create({
      data: {
        eventType: 'INCIDENT_DETECTED',
        details: incident
      }
    });

    if (incident.severity === 'CRITICAL') {
      await this.escalate(incident);
    }

    return incident;
  }

  private assessSeverity(type: Incident['type'], data: any): Incident['severity'] {
    if (type === 'BREACH') return 'CRITICAL';
    if (type === 'ATTACK' && data.threatScore > 70) return 'CRITICAL';
    if (type === 'ATTACK' && data.threatScore > 40) return 'HIGH';
    if (type === 'ANOMALY' && data.anomalyCount > 10) return 'HIGH';
    if (type === 'VIOLATION') return 'MEDIUM';
    return 'LOW';
  }

  private generateDescription(type: Incident['type'], data: any): string {
    const descriptions = {
      BREACH: `Security breach detected: ${data.details}`,
      ATTACK: `Attack detected with threat score ${data.threatScore}`,
      ANOMALY: `Anomalous behavior: ${data.anomalyCount} anomalies detected`,
      VIOLATION: `Constitutional violation: ${data.violation}`
    };
    return descriptions[type];
  }

  async investigate(incidentId: string) {
    const incident = this.activeIncidents.get(incidentId);
    if (!incident) return { error: 'Incident not found' };

    incident.status = 'INVESTIGATING';

    const evidence = await this.gatherEvidence(incident);
    const timeline = await this.buildTimeline(incident);
    const impact = this.assessImpact(incident);

    await prisma.auditLog.create({
      data: {
        eventType: 'INCIDENT_INVESTIGATION',
        details: { incidentId, evidence, timeline, impact }
      }
    });

    return { incident, evidence, timeline, impact };
  }

  private async gatherEvidence(incident: Incident) {
    const logs = await prisma.auditLog.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 3600000) }
      },
      take: 100
    });

    return {
      logCount: logs.length,
      suspiciousEvents: logs.filter(l => 
        l.eventType.includes('ALERT') || l.eventType.includes('THREAT')
      ).length,
      affectedUsers: new Set(logs.map(l => l.userId).filter(Boolean)).size
    };
  }

  private async buildTimeline(incident: Incident) {
    return [
      { time: new Date(), event: 'Incident detected', status: incident.status },
      { time: new Date(Date.now() - 300000), event: 'Suspicious activity began' },
      { time: new Date(), event: 'Investigation started' }
    ];
  }

  private assessImpact(incident: Incident) {
    return {
      severity: incident.severity,
      affectedSystems: incident.affectedSystems.length,
      estimatedUsers: incident.affectedSystems.length * 100,
      dataAtRisk: incident.type === 'BREACH' ? 'HIGH' : 'LOW'
    };
  }

  async contain(incidentId: string, actions: string[]) {
    const incident = this.activeIncidents.get(incidentId);
    if (!incident) return { error: 'Incident not found' };

    incident.status = 'CONTAINED';

    await prisma.auditLog.create({
      data: {
        eventType: 'INCIDENT_CONTAINED',
        details: { incidentId, actions }
      }
    });

    return {
      success: true,
      incident,
      actions,
      message: 'Incident successfully contained'
    };
  }

  async resolve(incidentId: string, resolution: string) {
    const incident = this.activeIncidents.get(incidentId);
    if (!incident) return { error: 'Incident not found' };

    incident.status = 'RESOLVED';
    this.activeIncidents.delete(incidentId);

    await prisma.auditLog.create({
      data: {
        eventType: 'INCIDENT_RESOLVED',
        details: { incidentId, resolution }
      }
    });

    return {
      success: true,
      incident,
      resolution,
      message: 'Incident resolved'
    };
  }

  private async escalate(incident: Incident) {
    await prisma.auditLog.create({
      data: {
        eventType: 'INCIDENT_ESCALATED',
        details: {
          incidentId: incident.id,
          severity: incident.severity,
          message: 'Critical incident escalated to security team'
        }
      }
    });
  }

  getActiveIncidents() {
    return Array.from(this.activeIncidents.values());
  }

  async getIncidentStats() {
    const [total, critical, resolved] = await Promise.all([
      prisma.auditLog.count({ where: { eventType: 'INCIDENT_DETECTED' } }),
      prisma.auditLog.count({ 
        where: { 
          eventType: 'INCIDENT_DETECTED',
          details: { path: ['severity'], equals: 'CRITICAL' }
        }
      }),
      prisma.auditLog.count({ where: { eventType: 'INCIDENT_RESOLVED' } })
    ]);

    return {
      total,
      critical,
      resolved,
      active: this.activeIncidents.size,
      resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(2) : 100
    };
  }
}

export default new IncidentResponse();
