interface ScalingMetrics {
  activeUsers: number;
  cpu: number;
  memory: number;
  instances: number;
}

class AutoScaler {
  private metrics: ScalingMetrics = { activeUsers: 0, cpu: 0, memory: 0, instances: 1 };
  private readonly MAX_USERS_PER_INSTANCE = 50000;
  private readonly CPU_THRESHOLD = 70;
  private readonly MEMORY_THRESHOLD = 80;

  async handleLoad(users: number): Promise<void> {
    this.metrics.activeUsers = users;
    this.metrics.cpu = (users / this.MAX_USERS_PER_INSTANCE) * 60 + Math.random() * 20;
    this.metrics.memory = (users / this.MAX_USERS_PER_INSTANCE) * 50 + Math.random() * 30;
    
    const requiredInstances = Math.ceil(users / this.MAX_USERS_PER_INSTANCE);
    const cpuInstances = Math.ceil((this.metrics.cpu / this.CPU_THRESHOLD) * this.metrics.instances);
    const memInstances = Math.ceil((this.metrics.memory / this.MEMORY_THRESHOLD) * this.metrics.instances);
    
    const targetInstances = Math.max(requiredInstances, cpuInstances, memInstances, 1);
    
    if (targetInstances > this.metrics.instances) {
      await this.scaleUp(targetInstances - this.metrics.instances);
    } else if (targetInstances < this.metrics.instances && this.metrics.instances > 1) {
      await this.scaleDown(this.metrics.instances - targetInstances);
    }
  }

  private async scaleUp(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      this.metrics.instances++;
      console.log(`[SCALE UP] Instance ${this.metrics.instances} launched`);
    }
  }

  private async scaleDown(count: number): Promise<void> {
    for (let i = 0; i < count && this.metrics.instances > 1; i++) {
      console.log(`[SCALE DOWN] Instance ${this.metrics.instances} terminated`);
      this.metrics.instances--;
    }
  }

  getMetrics(): ScalingMetrics {
    return { ...this.metrics };
  }

  canHandle10M(): boolean {
    return this.metrics.instances >= Math.ceil(10000000 / this.MAX_USERS_PER_INSTANCE);
  }
}

export const scaler = new AutoScaler();
