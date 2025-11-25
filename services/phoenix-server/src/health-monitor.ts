export interface ServiceHealth {
    name: string;
    url: string;
    status: 'healthy' | 'degraded' | 'down';
    lastCheck: string;
    responseTime: number;
    errorRate: number;
    uptime: number;
}

export interface HealthCheckResult {
    service: string;
    healthy: boolean;
    responseTime: number;
    error?: string;
    timestamp: string;
}

export class HealthMonitor {
    private services: Map<string, ServiceHealth>;
    private checkInterval: number;
    private monitoringActive: boolean;

    constructor(checkInterval: number = 30000) { // 30 seconds
        this.services = new Map();
        this.checkInterval = checkInterval;
        this.monitoringActive = false;
    }

    /**
     * Register a service for monitoring
     */
    registerService(name: string, url: string): void {
        this.services.set(name, {
            name,
            url,
            status: 'healthy',
            lastCheck: new Date().toISOString(),
            responseTime: 0,
            errorRate: 0,
            uptime: 100
        });
        console.log(`🔍 Registered ${name} for health monitoring`);
    }

    /**
     * Start continuous health monitoring
     */
    start(): void {
        if (this.monitoringActive) {
            console.log('Health monitoring already active');
            return;
        }

        this.monitoringActive = true;
        console.log(`🔍 Health monitoring started (checking every ${this.checkInterval}ms)`);

        this.monitorLoop();
    }

    /**
     * Stop health monitoring
     */
    stop(): void {
        this.monitoringActive = false;
        console.log('🔍 Health monitoring stopped');
    }

    /**
     * Continuous monitoring loop
     */
    private async monitorLoop(): Promise<void> {
        while (this.monitoringActive) {
            await this.checkAllServices();
            await this.sleep(this.checkInterval);
        }
    }

    /**
     * Check health of all registered services
     */
    private async checkAllServices(): Promise<void> {
        const checks = Array.from(this.services.keys()).map(serviceName =>
            this.checkService(serviceName)
        );

        await Promise.all(checks);
    }

    /**
     * Check health of a specific service
     */
    async checkService(serviceName: string): Promise<HealthCheckResult> {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`Service ${serviceName} not registered`);
        }

        const startTime = Date.now();

        try {
            const response = await fetch(`${service.url}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });

            const responseTime = Date.now() - startTime;
            const healthy = response.ok;

            // Update service health
            service.status = healthy ? 'healthy' : 'degraded';
            service.lastCheck = new Date().toISOString();
            service.responseTime = responseTime;

            // Calculate uptime
            if (healthy) {
                service.uptime = Math.min(100, service.uptime + 0.1);
            } else {
                service.uptime = Math.max(0, service.uptime - 1);
            }

            return {
                service: serviceName,
                healthy,
                responseTime,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            // Service is down
            service.status = 'down';
            service.lastCheck = new Date().toISOString();
            service.uptime = Math.max(0, service.uptime - 2);
            service.errorRate = Math.min(100, service.errorRate + 5);

            return {
                service: serviceName,
                healthy: false,
                responseTime: Date.now() - startTime,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get health status of all services
     */
    getAllHealth(): ServiceHealth[] {
        return Array.from(this.services.values());
    }

    /**
     * Get health status of a specific service
     */
    getServiceHealth(serviceName: string): ServiceHealth | undefined {
        return this.services.get(serviceName);
    }

    /**
     * Get list of unhealthy services
     */
    getUnhealthyServices(): ServiceHealth[] {
        return Array.from(this.services.values()).filter(
            service => service.status !== 'healthy'
        );
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default HealthMonitor;
