/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * COMMUNITY SAFETY SERVICE - Core Interfaces
 * 
 * Community-driven safety networks providing:
 * - Emergency incident reporting and response
 * - Real-time safety alerts
 * - Community watch networks
 * - Emergency services coordination
 */

export interface SafetyIncident {
  id: string;
  type: 'crime' | 'accident' | 'fire' | 'medical' | 'suspicious_activity' | 'environmental';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'verified' | 'responding' | 'resolved' | 'false_alarm';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    landmark?: string;
  };
  reporter: {
    userId: string;
    anonymous: boolean;
    verified: boolean;
  };
  description: string;
  media: MediaEvidence[];
  timestamp: Date;
  verifiedAt?: Date;
  resolvedAt?: Date;
  responders: Responder[];
  affectedRadius: number; // meters
  alertsSent: number;
}

export interface MediaEvidence {
  id: string;
  type: 'photo' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  verified: boolean;
}

export interface Responder {
  id: string;
  type: 'police' | 'medical' | 'fire' | 'community_volunteer' | 'private_security';
  name: string;
  status: 'dispatched' | 'en_route' | 'on_scene' | 'completed';
  eta?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  assignedAt: Date;
  arrivedAt?: Date;
}

export interface SafetyAlert {
  id: string;
  incidentId: string;
  type: 'emergency' | 'warning' | 'advisory' | 'all_clear';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  location: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  affectedUsers: number;
  sentAt: Date;
  expiresAt?: Date;
  acknowledgments: number;
}

export interface CommunityWatch {
  id: string;
  name: string;
  area: GeofenceArea;
  members: WatchMember[];
  coordinator: string;
  status: 'active' | 'inactive';
  stats: {
    incidentsReported: number;
    incidentsPrevented: number;
    responseTime: number; // average in minutes
    memberEngagement: number; // percentage
  };
  createdAt: Date;
}

export interface GeofenceArea {
  type: 'circle' | 'polygon';
  center?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  coordinates?: Array<{
    latitude: number;
    longitude: number;
  }>;
  name: string;
}

export interface WatchMember {
  userId: string;
  role: 'coordinator' | 'active_member' | 'observer';
  joinedAt: Date;
  stats: {
    reportsSubmitted: number;
    alertsReceived: number;
    responseRate: number;
  };
  verified: boolean;
  reputation: number; // 0-100
}

export interface EmergencyServices {
  id: string;
  type: 'police' | 'medical' | 'fire' | 'disaster_response';
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  contactNumber: string;
  emergencyNumber: string;
  availability: '24/7' | 'business_hours' | 'on_call';
  averageResponseTime: number; // minutes
  jurisdiction: GeofenceArea;
  status: 'active' | 'inactive' | 'overwhelmed';
}

export interface SafetyAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  area: GeofenceArea;
  incidents: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  responseMetrics: {
    averageResponseTime: number;
    incidentsResolved: number;
    resolutionRate: number;
  };
  safetyScore: number; // 0-100
  hotspots: SafetyHotspot[];
  recommendations: SafetyRecommendation[];
}

export interface SafetyHotspot {
  location: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  incidentCount: number;
  predominantType: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timePatterns: Array<{
    hour: number;
    count: number;
  }>;
  recommendedActions: string[];
}

export interface SafetyRecommendation {
  category: 'patrol' | 'lighting' | 'community_engagement' | 'infrastructure';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  affectedArea: GeofenceArea;
  expectedImpact: string;
  estimatedCost?: number;
  timeline: string;
}

export interface UserSafetyProfile {
  userId: string;
  safetyScore: number; // 0-100
  homeLocation?: {
    latitude: number;
    longitude: number;
  };
  safeRoutes: SavedRoute[];
  emergencyContacts: EmergencyContact[];
  watchMemberships: string[];
  incidentsReported: number;
  reputation: number;
  preferences: {
    alertRadius: number;
    alertTypes: string[];
    quiet Hours: {
      start: number;
      end: number;
    };
  };
}

export interface SavedRoute {
  id: string;
  name: string;
  waypoints: Array<{
    latitude: number;
    longitude: number;
  }>;
  safetyScore: number;
  lastUsed: Date;
  avgDuration: number; // minutes
  riskAreas: number;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  canNotify: boolean;
  priority: number;
}

export interface SafetyTip {
  id: string;
  category: 'personal_safety' | 'home_security' | 'cyber_safety' | 'emergency_prep';
  title: string;
  content: string;
  relevance: number; // based on user location/profile
  source: string;
  lastUpdated: Date;
}
