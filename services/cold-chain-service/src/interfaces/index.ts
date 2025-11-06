/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * COLD CHAIN SERVICE - Core Interfaces
 * 
 * Enterprise cold chain monitoring and compliance system for:
 * - Pharmaceutical distribution
 * - Food supply chain
 * - Vaccine distribution
 * - Temperature-sensitive logistics
 */

export interface ColdChainClient {
  id: string;
  companyName: string;
  industry: 'pharmaceutical' | 'food' | 'healthcare' | 'agriculture';
  vehicles: ColdChainVehicle[];
  warehouses: ColdChainWarehouse[];
  subscription: SubscriptionInfo;
  complianceStandards: ComplianceStandard[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
}

export interface ColdChainVehicle {
  id: string;
  clientId: string;
  vehicleId: string;
  type: 'refrigerated_truck' | 'freezer_truck' | 'temperature_controlled_van';
  sensors: TemperatureSensor[];
  gpsTracker: GPSTracker;
  capacity: number;
  temperatureRange: {
    min: number;
    max: number;
  };
  status: 'active' | 'in_transit' | 'maintenance' | 'offline';
  lastMaintenance: Date;
  nextMaintenance: Date;
}

export interface ColdChainWarehouse {
  id: string;
  clientId: string;
  name: string;
  location: LocationData;
  zones: StorageZone[];
  sensors: TemperatureSensor[];
  capacity: number;
  utilizationPercentage: number;
}

export interface TemperatureSensor {
  id: string;
  type: 'temperature' | 'humidity' | 'door_status' | 'shock';
  location: string;
  currentReading: SensorReading;
  calibrationDate: Date;
  status: 'active' | 'inactive' | 'error' | 'needs_calibration';
  alerts: SensorAlert[];
}

export interface SensorReading {
  timestamp: Date;
  temperature?: number;
  humidity?: number;
  batteryLevel?: number;
  signalStrength?: number;
  quality: 'good' | 'fair' | 'poor';
}

export interface SensorAlert {
  id: string;
  sensorId: string;
  type: 'temperature_excursion' | 'humidity_high' | 'door_open' | 'sensor_offline' | 'battery_low';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
  metadata: Record<string, any>;
}

export interface GPSTracker {
  deviceId: string;
  currentLocation: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  lastUpdate: Date;
  speed?: number;
  heading?: number;
  accuracy: number;
}

export interface StorageZone {
  id: string;
  warehouseId: string;
  name: string;
  temperatureRange: {
    min: number;
    max: number;
  };
  currentTemperature: number;
  products: StoredProduct[];
  capacity: number;
  utilized: number;
}

export interface StoredProduct {
  id: string;
  name: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  expiryDate: Date;
  receivedDate: Date;
  temperatureRequirement: {
    min: number;
    max: number;
  };
  complianceStatus: 'compliant' | 'at_risk' | 'non_compliant';
}

export interface Shipment {
  id: string;
  clientId: string;
  vehicleId: string;
  origin: LocationData;
  destination: LocationData;
  products: ShipmentProduct[];
  status: 'preparing' | 'in_transit' | 'delivered' | 'delayed' | 'compromised';
  departureTime?: Date;
  estimatedArrival: Date;
  actualArrival?: Date;
  temperatureLog: TemperatureLogEntry[];
  complianceReport?: ComplianceReport;
  alerts: ShipmentAlert[];
}

export interface ShipmentProduct {
  productId: string;
  name: string;
  quantity: number;
  batchNumber: string;
  temperatureRequirement: {
    min: number;
    max: number;
  };
}

export interface TemperatureLogEntry {
  timestamp: Date;
  temperature: number;
  humidity: number;
  location: {
    latitude: number;
    longitude: number;
  };
  withinSpec: boolean;
  excursionDuration?: number;
}

export interface ShipmentAlert {
  id: string;
  shipmentId: string;
  type: 'temperature_excursion' | 'route_deviation' | 'delay' | 'door_opened';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  actionTaken?: string;
}

export interface ComplianceReport {
  id: string;
  shipmentId?: string;
  clientId: string;
  reportType: 'shipment' | 'warehouse' | 'vehicle' | 'audit';
  period: {
    start: Date;
    end: Date;
  };
  standards: ComplianceStandard[];
  findings: ComplianceFinding[];
  temperatureExcursions: TemperatureExcursion[];
  overallStatus: 'compliant' | 'minor_issues' | 'major_issues' | 'non_compliant';
  generatedAt: Date;
  reportUrl?: string;
}

export interface ComplianceStandard {
  name: string;
  version: string;
  region: 'south_africa' | 'africa' | 'who' | 'fda' | 'eu';
  requirements: string[];
}

export interface ComplianceFinding {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  affectedShipments?: string[];
  deadline?: Date;
}

export interface TemperatureExcursion {
  id: string;
  start: Date;
  end?: Date;
  duration: number;
  minTemp: number;
  maxTemp: number;
  averageTemp: number;
  requiredRange: {
    min: number;
    max: number;
  };
  severity: 'minor' | 'moderate' | 'severe';
  impact: 'none' | 'quality_affected' | 'product_compromised';
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface LocationData {
  address: string;
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface SubscriptionInfo {
  tier: 'basic' | 'professional' | 'enterprise';
  features: string[];
  maxVehicles: number;
  maxWarehouses: number;
  dataRetention: number;
  billingCycle: 'monthly' | 'annual';
  pricePerMonth: number;
}

export interface MonitoringDashboard {
  activeShipments: number;
  shipmentsAtRisk: number;
  activeAlerts: ShipmentAlert[];
  temperatureCompliance: number;
  vehicleStatus: {
    active: number;
    maintenance: number;
    offline: number;
  };
  warehouseUtilization: number;
  recentExcursions: TemperatureExcursion[];
}

export interface Analytics {
  period: {
    start: Date;
    end: Date;
  };
  totalShipments: number;
  successfulDeliveries: number;
  compromisedShipments: number;
  averageTemperatureCompliance: number;
  temperatureExcursions: number;
  onTimeDeliveryRate: number;
  costSavings: number;
  recommendations: Recommendation[];
}

export interface Recommendation {
  category: 'route_optimization' | 'maintenance' | 'training' | 'equipment';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  expectedImpact: string;
  implementationSteps: string[];
}
