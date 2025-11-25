/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * RETAIL AI SERVICE - Core Interfaces
 * 
 * Enterprise-grade retail AI solution providing:
 * - Customer analytics and behavior tracking
 * - Inventory optimization with AI predictions
 * - Loss prevention and security monitoring
 * - Real-time sales insights and forecasting
 */

export interface RetailClient {
  id: string;
  companyName: string;
  industry: 'grocery' | 'fashion' | 'electronics' | 'pharmacy' | 'general';
  locations: RetailLocation[];
  subscription: SubscriptionTier;
  status: 'active' | 'inactive' | 'trial' | 'suspended';
  createdAt: Date;
  billingInfo: BillingInformation;
}

export interface RetailLocation {
  id: string;
  clientId: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  cameras: CameraDevice[];
  sensors: IoTSensor[];
  storeSize: number; // square meters
  averageFootfall: number; // daily average
  timezone: string;
}

export interface CameraDevice {
  id: string;
  locationId: string;
  name: string;
  type: 'entrance' | 'aisle' | 'checkout' | 'stockroom' | 'exterior';
  status: 'active' | 'inactive' | 'maintenance';
  capabilities: CameraCapability[];
  resolution: string;
  aiEnabled: boolean;
  lastMaintenance: Date;
}

export interface CameraCapability {
  type: 'facial_recognition' | 'object_detection' | 'motion_tracking' | 'heat_mapping' | 'crowd_analysis';
  enabled: boolean;
  accuracy: number;
}

export interface IoTSensor {
  id: string;
  locationId: string;
  type: 'temperature' | 'humidity' | 'footfall' | 'shelf_weight' | 'door_entry';
  location: string;
  status: 'active' | 'inactive' | 'error';
  lastReading: SensorReading;
}

export interface SensorReading {
  timestamp: Date;
  value: number;
  unit: string;
  quality: 'good' | 'fair' | 'poor';
}

export interface CustomerBehaviorAnalytics {
  locationId: string;
  period: TimePeriod;
  footfall: FootfallAnalytics;
  heatmaps: HeatmapData[];
  dwellTime: DwellTimeAnalytics;
  conversionRate: number;
  peakHours: PeakHourData[];
  customerDemographics: DemographicData;
}

export interface FootfallAnalytics {
  totalVisitors: number;
  uniqueVisitors: number;
  returningVisitors: number;
  averageVisitDuration: number; // minutes
  hourlyDistribution: HourlyData[];
  dayOfWeekDistribution: DailyData[];
}

export interface HeatmapData {
  zone: string;
  coordinates: Array<{ x: number; y: number }>;
  intensity: number; // 0-100
  averageDwellTime: number;
  conversionRate: number;
}

export interface DwellTimeAnalytics {
  overall: number;
  byZone: Map<string, number>;
  byTimeOfDay: Map<number, number>;
  correlation: {
    withPurchase: number;
    withValue: number;
  };
}

export interface PeakHourData {
  hour: number;
  dayOfWeek: string;
  averageFootfall: number;
  staffingRecommendation: number;
}

export interface DemographicData {
  ageGroups: Map<string, number>;
  genderDistribution: Map<string, number>;
  loyaltyTiers: Map<string, number>;
}

export interface InventoryOptimization {
  locationId: string;
  productId: string;
  currentStock: number;
  predictedDemand: DemandPrediction;
  reorderPoint: number;
  optimalStock: number;
  recommendations: InventoryRecommendation[];
  alerts: InventoryAlert[];
}

export interface DemandPrediction {
  nextWeek: number;
  nextMonth: number;
  seasonalTrend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  factors: PredictionFactor[];
}

export interface PredictionFactor {
  type: 'weather' | 'event' | 'promotion' | 'trend' | 'seasonality';
  impact: number; // -100 to 100
  description: string;
}

export interface InventoryRecommendation {
  type: 'restock' | 'reduce' | 'promote' | 'discontinue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  expectedImpact: {
    revenue: number;
    margin: number;
    turnover: number;
  };
  actionBy: Date;
}

export interface InventoryAlert {
  severity: 'info' | 'warning' | 'critical';
  type: 'low_stock' | 'overstock' | 'expiring' | 'slow_moving' | 'theft_detected';
  message: string;
  affectedProducts: string[];
  recommendedAction: string;
  timestamp: Date;
}

export interface LossPreventionEvent {
  id: string;
  locationId: string;
  type: 'suspicious_behavior' | 'theft_detected' | 'unusual_pattern' | 'access_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  cameraId: string;
  description: string;
  evidence: Evidence[];
  aiConfidence: number;
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolution?: string;
}

export interface Evidence {
  type: 'video' | 'image' | 'sensor_data' | 'transaction';
  url: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface SalesInsight {
  locationId: string;
  period: TimePeriod;
  revenue: RevenueAnalytics;
  products: ProductPerformance[];
  forecast: SalesForecast;
  comparisons: ComparisonMetrics;
  recommendations: BusinessRecommendation[];
}

export interface RevenueAnalytics {
  total: number;
  growth: number; // percentage
  byCategory: Map<string, number>;
  byHour: Map<number, number>;
  byPaymentMethod: Map<string, number>;
  averageTransaction: number;
  transactionCount: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  revenue: number;
  unitsSold: number;
  margin: number;
  marginPercentage: number;
  trend: 'rising' | 'falling' | 'stable';
  rank: number;
  stockDays: number;
}

export interface SalesForecast {
  nextDay: ForecastData;
  nextWeek: ForecastData;
  nextMonth: ForecastData;
  confidence: number;
  methodology: string;
}

export interface ForecastData {
  revenue: number;
  transactions: number;
  averageValue: number;
  confidence: number;
}

export interface ComparisonMetrics {
  previousPeriod: {
    revenue: number;
    growth: number;
  };
  previousYear: {
    revenue: number;
    growth: number;
  };
  budget: {
    target: number;
    actual: number;
    variance: number;
  };
}

export interface BusinessRecommendation {
  category: 'pricing' | 'staffing' | 'marketing' | 'inventory' | 'operations';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  expectedImpact: {
    revenue: number;
    cost: number;
    roi: number;
  };
  implementation: {
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    steps: string[];
  };
}

export interface TimePeriod {
  start: Date;
  end: Date;
  granularity: 'hour' | 'day' | 'week' | 'month';
}

export interface HourlyData {
  hour: number;
  value: number;
  label: string;
}

export interface DailyData {
  dayOfWeek: string;
  value: number;
  date?: Date;
}

export interface SubscriptionTier {
  tier: 'basic' | 'professional' | 'enterprise';
  features: string[];
  pricePerLocation: number;
  billingCycle: 'monthly' | 'annual';
  maxLocations: number;
  maxCameras: number;
  analyticsRetention: number; // days
}

export interface BillingInformation {
  azoraClientId: string;
  paymentMethod: string;
  billingCycle: 'monthly' | 'annual';
  nextBillingDate: Date;
  amount: number;
  currency: string;
  status: 'current' | 'overdue' | 'suspended';
}

export interface EnterpriseAlert {
  id: string;
  clientId: string;
  type: 'performance' | 'security' | 'billing' | 'system' | 'compliance';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
  metadata: Record<string, any>;
}

export interface ComplianceReport {
  id: string;
  clientId: string;
  reportType: 'gdpr' | 'privacy' | 'security' | 'audit';
  period: TimePeriod;
  status: 'compliant' | 'issues_found' | 'critical';
  findings: ComplianceFinding[];
  recommendations: string[];
  generatedAt: Date;
  generatedBy: string;
}

export interface ComplianceFinding {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedSystems: string[];
  remediation: string;
  deadline?: Date;
}
