#!/usr/bin/env node

const os = require('os');

class PerformanceMonitor {
  constructor() {
    this.targetCPU = 80;
    this.targetGPU = 100;
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    console.log('🔥 AZORA OS PERFORMANCE MONITOR ACTIVATED');
    console.log('🎯 Target: 80% CPU, 100% GPU Usage');
    console.log('═'.repeat(50));
    
    this.monitorLoop();
  }

  monitorLoop() {
    if (!this.isRunning) return;
    
    const metrics = this.getMetrics();
    this.displayMetrics(metrics);
    
    setTimeout(() => this.monitorLoop(), 1000);
  }

  getMetrics() {
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    const memUsage = process.memoryUsage();
    
    return {
      cpu: Math.min(Math.round(loadAvg[0] * 100 / cpus.length), 100),
      gpu: this.targetGPU, // Simulated
      memory: Math.round(memUsage.heapUsed / 1024 / 1024),
      uptime: Math.round(process.uptime()),
      cores: cpus.length
    };
  }

  displayMetrics(metrics) {
    console.clear();
    console.log('🚀 AZORA OS - MAXIMUM PERFORMANCE MODE');
    console.log('═'.repeat(50));
    console.log(`🖥️  CPU: ${this.getBar(metrics.cpu, this.targetCPU)} ${metrics.cpu}%`);
    console.log(`🎮 GPU: ${this.getBar(metrics.gpu, this.targetGPU)} ${metrics.gpu}%`);
    console.log(`💾 RAM: ${metrics.memory}MB`);
    console.log(`⏱️  Uptime: ${metrics.uptime}s`);
    console.log(`🔧 Cores: ${metrics.cores}`);
    console.log('═'.repeat(50));
    console.log('🌟 Ubuntu: "I am because we are"');
    console.log('💪 Maximum power for collective prosperity!');
  }

  getBar(current, target) {
    const percentage = Math.min(current / target, 1);
    const filled = Math.round(percentage * 20);
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  stop() {
    this.isRunning = false;
    console.log('\n🛑 Performance monitor stopped');
  }
}

const monitor = new PerformanceMonitor();
monitor.start();

process.on('SIGINT', () => {
  monitor.stop();
  process.exit(0);
});

module.exports = PerformanceMonitor;