import React from 'react';
import {
    Home, GraduationCap, Wallet, Users, Rocket, Brain, Terminal, BookOpen,
    Building2, ShoppingBag, Cloud, ShieldCheck, PieChart, TrendingUp,
    Database, BarChart3, Settings, HelpCircle, MessageSquare, Lock
} from 'lucide-react';
import { DashboardApp } from '../apps/DashboardApp';
import { LearnApp } from '../apps/LearnApp';
import { MintApp } from '../apps/MintApp';
import { SpacesApp } from '../apps/SpacesApp';
import { IncubatorApp } from '../apps/IncubatorApp';
import { ElaraMind } from '../apps/ElaraMind';
import { ForgeStudio } from '../apps/ForgeStudio';
import { SimulationHub } from '../apps/SimulationHub';

import { EnterprisePortal } from '../apps/EnterprisePortal';

import { Marketplace } from '../apps/Marketplace';

import { CloudManager } from '../apps/CloudManager';

import { ComplianceCenter } from '../apps/ComplianceCenter';

import { FinanceHub } from '../apps/FinanceHub';

import { InvestorDashboard } from '../apps/InvestorDashboard';

import { DataIngestion } from '../apps/DataIngestion';

import { Analytics } from '../apps/Analytics';

import { SettingsApp } from '../apps/SettingsApp';

import { HelpSupport } from '../apps/HelpSupport';

import { Communications } from '../apps/Communications';

import { SecurityApp } from '../apps/SecurityApp';

// Placeholder components for new apps (to be implemented)

export const APPS = {
    // Core Apps (Existing)
    DASHBOARD: { id: 'dashboard', title: 'Dashboard', icon: Home, component: DashboardApp },
    LEARN: { id: 'learn', title: 'Learn', icon: GraduationCap, component: LearnApp },
    MINT: { id: 'mint', title: 'Mint', icon: Wallet, component: MintApp },
    SPACES: { id: 'spaces', title: 'Spaces', icon: Users, component: SpacesApp },
    INCUBATOR: { id: 'incubator', title: 'Incubator', icon: Rocket, component: IncubatorApp },
    ELARA: { id: 'elara', title: 'Elara Mind', icon: Brain, component: ElaraMind },
    FORGE: { id: 'forge', title: 'Forge Studio', icon: Terminal, component: ForgeStudio },
    SIMULATIONS: { id: 'simulations', title: 'Simulation Hub', icon: BookOpen, component: SimulationHub },

    // Enterprise & Utility Apps (New)
    ENTERPRISE: { id: 'enterprise', title: 'Enterprise Portal', icon: Building2, component: EnterprisePortal },
    MARKETPLACE: { id: 'marketplace', title: 'Marketplace', icon: ShoppingBag, component: Marketplace },
    CLOUD: { id: 'cloud', title: 'Cloud Manager', icon: Cloud, component: CloudManager },
    COMPLIANCE: { id: 'compliance', title: 'Compliance Center', icon: ShieldCheck, component: ComplianceCenter },
    FINANCE: { id: 'finance', title: 'Finance Hub', icon: PieChart, component: FinanceHub },
    INVESTOR: { id: 'investor', title: 'Investor Dashboard', icon: TrendingUp, component: InvestorDashboard },
    INGESTION: { id: 'ingestion', title: 'Data Ingestion', icon: Database, component: DataIngestion },
    ANALYTICS: { id: 'analytics', title: 'Analytics', icon: BarChart3, component: Analytics },
    SETTINGS: { id: 'settings', title: 'Settings', icon: Settings, component: SettingsApp },
    HELP: { id: 'help', title: 'Help & Support', icon: HelpCircle, component: HelpSupport },
    COMMUNICATIONS: { id: 'communications', title: 'Communications', icon: MessageSquare, component: Communications },
    SECURITY: { id: 'security', title: 'Security', icon: Lock, component: SecurityApp },
};
