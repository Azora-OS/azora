export interface PredAISensorContext {
    userId: string;
    currentActivity: any;
    projectState?: any;
    learningHistory?: any;
    systemMetrics?: any; // New: For Chaos/PrePEng
}

export interface Prediction {
    type: 'RESOURCE' | 'KNOWLEDGE' | 'COLLABORATION' | 'RISK' | 'ARCHITECTURE' | 'RESILIENCE';
    confidence: number;
    timeHorizon: number;
    suggestion: any;
}

// Sub-Engine: PrePEng (Predictive Provisioning Engine)
class PrePEng {
    static async predict(context: PredAISensorContext): Promise<Prediction[]> {
        const predictions: Prediction[] = [];
        const activity = context.currentActivity;

        // GPU Provisioning
        if (activity?.type === 'MODEL_TRAINING_SETUP' ||
            (activity?.code && /import\s+(torch|tensorflow|keras)/.test(activity.code)) ||
            (activity?.command && /python.*train/.test(activity.command))) {
            predictions.push({
                type: 'RESOURCE',
                confidence: 0.95,
                timeHorizon: 300,
                suggestion: {
                    action: 'PROVISION_GPU',
                    params: { type: 'NVIDIA_A100', count: 1 },
                    message: "PrePEng: I've pre-warmed an A100 GPU for your training job.",
                    reason: 'Deep learning pattern detected'
                }
            });
        }
        return predictions;
    }
}

// Sub-Engine: Sankofa (Architectural Intelligence)
class SankofaIntegration {
    static async predict(context: PredAISensorContext): Promise<Prediction[]> {
        const predictions: Prediction[] = [];
        const project = context.projectState;

        // Monolith Detection
        if (project?.fileCount > 50 && !project?.hasMicroservices) {
            predictions.push({
                type: 'ARCHITECTURE',
                confidence: 0.85,
                timeHorizon: 0,
                suggestion: {
                    action: 'SUGGEST_REFACTOR',
                    message: "Sankofa: This component is getting large. Consider splitting into microservices.",
                    reason: 'High complexity detected in single module'
                }
            });
        }
        return predictions;
    }
}

// Sub-Engine: Chaos Monkey (Resilience Intelligence)
class ChaosIntegration {
    static async predict(context: PredAISensorContext): Promise<Prediction[]> {
        const predictions: Prediction[] = [];
        const metrics = context.systemMetrics;

        // Fragility Detection
        if (metrics?.errorRate > 0.05 && metrics?.cpuUsage < 0.2) {
            predictions.push({
                type: 'RESILIENCE',
                confidence: 0.90,
                timeHorizon: 60,
                suggestion: {
                    action: 'TRIGGER_CHAOS_TEST',
                    params: { test: 'LATENCY_INJECTION' },
                    message: "Chaos Monkey: Error rate is suspicious despite low load. Initiating latency test.",
                    reason: 'Anomaly detected in error/load ratio'
                }
            });
        }
        return predictions;
    }
}

export class CitadelPredAISensor {

    async predictResourceNeeds(context: PredAISensorContext): Promise<Prediction[]> {
        return PrePEng.predict(context);
    }

    async predictLearningNeeds(context: PredAISensorContext): Promise<Prediction[]> {
        // Keep existing learning logic here or move to "SapiensEngine"
        const predictions: Prediction[] = [];
        const history = context.learningHistory;

        if (history?.recentErrors?.length >= 3) {
            const lastError = history.recentErrors[0];
            predictions.push({
                type: 'KNOWLEDGE',
                confidence: 0.92,
                timeHorizon: 0,
                suggestion: {
                    action: 'OFFER_TUTORIAL',
                    resourceId: `tutorial-${lastError.type.toLowerCase()}`,
                    message: `Sapiens: It looks like ${lastError.type} is tricky. Here's a micro-lesson.`,
                    reason: `Repeated ${lastError.type} errors detected`
                }
            });
        }
        return predictions;
    }

    async predictArchitecturalNeeds(context: PredAISensorContext): Promise<Prediction[]> {
        return SankofaIntegration.predict(context);
    }

    async predictResilienceNeeds(context: PredAISensorContext): Promise<Prediction[]> {
        return ChaosIntegration.predict(context);
    }

    // Master method to get all predictions
    async getAllPredictions(context: PredAISensorContext): Promise<Prediction[]> {
        const [resources, learning, architecture, resilience] = await Promise.all([
            this.predictResourceNeeds(context),
            this.predictLearningNeeds(context),
            this.predictArchitecturalNeeds(context),
            this.predictResilienceNeeds(context)
        ]);
        return [...resources, ...learning, ...architecture, ...resilience];
    }
}
