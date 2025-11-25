/**
 * AzStudio Services
 * 
 * This module exports all the core services for code generation,
 * transformation, and execution.
 */

// Core Code Services
export { CodeExecutor, ASTTransform, TransformResult, Diagnostic } from './CodeExecutor';
export { ChangesetManager, FileChange, Changeset, RollbackData, ChangesetPreview } from './ChangesetManager';
export { ServiceGenerator, ServiceSpec } from './ServiceGenerator';
export { APIGenerator, APIEndpointSpec } from './APIGenerator';

// AI Services
export { AIOrchestrator, AIContext } from './AIOrchestrator';
export { PlannerAgent, Task } from './PlannerAgent';
export { CodeGeneratorAgent, GeneratedFile, GenerationResult } from './CodeGeneratorAgent';
export { ContextManager } from './ContextManager';

// Project Analysis
export { ProjectIndexer } from './ProjectIndexer';
export { FrameworkDetector } from './FrameworkDetector';
export { FileWatcher } from './FileWatcher';

// Design System
export { DesignTokenManager, DesignTokens, ColorScale } from './DesignTokenManager';
export { DesignFilterEngine, DesignFilter, ClassMapping } from './DesignFilterEngine';
export { ComponentStyleRefactor, ComponentStyleInfo, RefactorResult } from './ComponentStyleRefactor';
export { PreviewGenerator, Screenshot, ComponentPreview, PreviewComparison, PreviewOptions } from './PreviewGenerator';

// Verification & Testing
export { VerificationPipeline, TestResults, VerificationReport } from './VerificationPipeline';
export { VerificationGate, ChangeType, VerificationRequirements, FixSuggestion, VerificationGateReport } from './VerificationGate';
export { PlaywrightRunner, E2ETestScenario, E2ETestResult, E2EResults } from './PlaywrightRunner';
export { AccessibilityChecker, A11yReport, A11yViolation, A11yCheckOptions } from './AccessibilityChecker';
export { LighthouseRunner, PerformanceReport, CoreWebVitals, PerformanceScores, PerformanceRecommendation, PerformanceHistory, LighthouseOptions } from './LighthouseRunner';

// UI & Database
export { UIBuilder, UIComponent, PageLayout } from './UIBuilder';
export { DatabaseDesigner, DatabaseModel, ModelField, ModelRelation, DatabaseSchema } from './DatabaseDesigner';
export { APIConnectionManager, APIEndpoint, APIConnection, ReactQueryHookOptions } from './APIConnectionManager';
export { FormBuilder, FormSpec, FormField, FieldValidation } from './FormBuilder';

// Platform Templates
export { PlatformTemplate, TemplateMetadata } from './templates/PlatformTemplate';
export { EducationPlatformTemplate, EducationPlatformConfig } from './templates/EducationPlatformTemplate';

// Service Components
export { AuthServiceComponent, AuthServiceConfig } from './components/AuthServiceComponent';
export { PaymentServiceComponent, PaymentServiceConfig } from './components/PaymentServiceComponent';
export { EmailServiceComponent, EmailServiceConfig } from './components/EmailServiceComponent';
export { StorageServiceComponent, StorageServiceConfig } from './components/StorageServiceComponent';
export { ServiceConnectionGenerator, ServiceConnection, ConnectionEndpoint } from './components/ServiceConnectionGenerator';

// Course Content Studio
export { CourseBuilder, Course, Module, Lesson, CourseMetadata, LessonType, QuizQuestion, CodeExercise } from './CourseBuilder';
export { ElaraAI, ContentGenerationOptions, LessonScript, GeneratedContent, ContentQualityReport } from './ElaraAI';
export { TextToSpeechService, Voice, TTSOptions, AudioGenerationResult, AudioPreview } from './TextToSpeech';
export { VideoGenerationService, Avatar, VideoGenerationOptions, SlideVideoOptions, Slide, VideoGenerationResult, VideoPreview } from './VideoGeneration';
export { CourseDatabaseGenerator, PrismaSchemaOptions, EnrollmentTracking, ProgressTracking, CertificateSystem } from './CourseDatabase';

// Git Integration
export { GitService, GitConfig, GitStatus, GitCommit, GitBranch, GitRemote, GitCredentials } from './GitService';

// Security & Secrets Management
export { SecretsVault, Secret, EncryptedSecret } from './SecretsVault';
export { PermissionManager, PermissionType, PermissionGrant, PermissionRequestOptions, AllowlistEntry } from './PermissionManager';
export { AuditLogger, AuditEventType, AuditSeverity, AuditEvent, AuditQueryOptions, AuditStatistics } from './AuditLogger';
export { NetworkSandbox, NetworkRequestOptions, NetworkResponse } from './NetworkSandbox';

// Deployment
export { DeploymentManager, EnvironmentConfig, DeploymentHistory, DeploymentStatus, VercelConfig, RailwayConfig, DockerConfig } from './DeploymentManager';
export { VercelDeployment, VercelDeploymentOptions, VercelDeploymentResult } from './VercelDeployment';
export { RailwayDeployment, RailwayDeploymentOptions, RailwayDeploymentResult } from './RailwayDeployment';
export { DockerDeployment, DockerDeploymentOptions, DockerDeploymentResult, DockerfileTemplate } from './DockerDeployment';
export { DeploymentMonitor, ServiceHealth, ServiceMetrics, MonitoringConfig } from './DeploymentMonitor';

// Monitoring & Analytics
export { CodeInstrumentation, InstrumentationConfig, InstrumentationResult } from './CodeInstrumentation';
export { MetricsDashboard, ServiceMetrics, CustomMetric, DashboardData, Alert } from './MetricsDashboard';
export { ErrorTracking, ErrorEvent, ErrorGroup, ErrorInsight, ErrorNotification } from './ErrorTracking';
export { AnalyticsDashboard, AnalyticsEvent, APIUsageMetrics, UserJourney, ConversionFunnel, BusinessMetrics } from './AnalyticsDashboard';
export { MonitoringIntegrations, IntegrationConfig, SentryConfig, DataDogConfig, NewRelicConfig, PrometheusConfig, GrafanaConfig } from './MonitoringIntegrations';
