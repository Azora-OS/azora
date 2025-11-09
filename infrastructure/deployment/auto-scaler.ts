export class AutoScaler {
  private currentReplicas = 1
  private readonly minReplicas = 1
  private readonly maxReplicas = 10
  private readonly targetCPU = 70

  async checkAndScale(cpuUsage: number, memoryUsage: number): Promise<number> {
    let newReplicas = this.currentReplicas

    // Scale up if CPU > 70% or Memory > 80%
    if (cpuUsage > this.targetCPU || memoryUsage > 80) {
      newReplicas = Math.min(this.currentReplicas + 1, this.maxReplicas)
    }
    
    // Scale down if CPU < 30% and Memory < 50%
    if (cpuUsage < 30 && memoryUsage < 50) {
      newReplicas = Math.max(this.currentReplicas - 1, this.minReplicas)
    }

    if (newReplicas !== this.currentReplicas) {
      console.log(`Scaling from ${this.currentReplicas} to ${newReplicas} replicas`)
      this.currentReplicas = newReplicas
    }

    return this.currentReplicas
  }

  getCurrentReplicas(): number {
    return this.currentReplicas
  }
}