/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SHARED DESIGN EXPORTS - Master UI Template
World-class design system for Constitutional AI
*/

// Core utilities
export * from './utils/index'
export * from './components/navigation'

// Premium UI Components
export { BackgroundGradientAnimation } from './components/background-gradient-animation'
export { Button } from './components/Button'
export { FinanceDashboard } from './components/FinanceDashboard'
export { AIFamilyChat } from './components/AIFamilyChat'
export { AzStudio } from './components/AzStudio'
export { UbuntuPhilosophyCard, UbuntuPhilosophyBadge } from './components/UbuntuPhilosophyCard'

// Master UI Components
export * from './azora-master-components'

// Layouts
export * from './layouts/AppLayout'

// Hooks
export * from './hooks/useWallet'
export * from './hooks/useApi'

// API & Backend Integration (Phase 2)
export { default as api, apiClient } from './lib/api-client'
export { default as wsClient } from './lib/websocket-client'
export { authOptions } from './lib/auth-config'

// State Management
export * from './stores'

// Data services (existing)
export * from './data-service'
export * from './hooks'
export * from './api-routes'
export * from './trinity-gem'
export * from './telemetry'