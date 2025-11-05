/**
 * AZORA OS - Process Manager
 *
 * Advanced process management system with resource allocation, scheduling,
 * inter-process communication, and system monitoring.
 */

export interface ProcessConfig {
  id: string;
  name: string;
  executable: string;
  args?: string[];
  environment?: { [key: string]: string };
  workingDirectory?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  cpuAffinity?: number[];
  memoryLimit?: number; // bytes
  maxRuntime?: number; // milliseconds
  autoRestart?: boolean;
  dependencies?: string[]; // process IDs this process depends on
}

export interface ProcessInfo {
  id: string;
  name: string;
  pid: number;
  status: 'running' | 'stopped' | 'paused' | 'terminated' | 'error';
  startTime: Date;
  cpuUsage: number;
  memoryUsage: number;
  threads: number;
  priority: number;
  parentId?: string;
  children: string[];
  config: ProcessConfig;
  exitCode?: number;
  errorMessage?: string;
}

export interface SystemResources {
  totalCpuCores: number;
  availableCpuCores: number;
  totalMemory: number;
  availableMemory: number;
  totalDiskSpace: number;
  availableDiskSpace: number;
  networkInterfaces: NetworkInterface[];
}

export interface NetworkInterface {
  name: string;
  address: string;
  netmask: string;
  mac: string;
  rxBytes: number;
  txBytes: number;
}

export interface ProcessScheduler {
  algorithm: 'round-robin' | 'priority' | 'fair-share' | 'real-time';
  timeSlice: number; // milliseconds
  priorityLevels: number;
}

export interface IPCMessage {
  id: string;
  from: string;
  to: string;
  type: string;
  payload: any;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * Process Manager
 * Manages all running processes, resource allocation, and system scheduling
 */
export class ProcessManager {
  private processes: Map<string, ProcessInfo> = new Map();
  private systemResources: SystemResources;
  private scheduler: ProcessScheduler;
  private ipcQueue: IPCMessage[] = [];
  private resourceLocks: Map<string, string> = new Map(); // resource -> processId
  private performanceMonitor: NodeJS.Timeout;

  // Event listeners
  private processEventListeners: ((event: string, processId: string, data?: any) => void)[] = [];

  constructor() {
    this.systemResources = this.getInitialSystemResources();
    this.scheduler = {
      algorithm: 'priority',
      timeSlice: 100, // 100ms time slices
      priorityLevels: 5,
    };

    this.initializeSystem();
    this.startPerformanceMonitoring();
  }

  /**
   * Initialize core system processes
   */
  private async initializeSystem(): Promise<void> {
    // Start essential system processes
    const systemProcesses: ProcessConfig[] = [
      {
        id: 'kernel-monitor',
        name: 'Kernel Monitor',
        executable: 'kernel-monitor',
        priority: 'critical',
        autoRestart: true,
      },
      {
        id: 'resource-manager',
        name: 'Resource Manager',
        executable: 'resource-manager',
        priority: 'high',
        autoRestart: true,
      },
      {
        id: 'network-manager',
        name: 'Network Manager',
        executable: 'network-manager',
        priority: 'high',
        autoRestart: true,
      },
      {
        id: 'filesystem-monitor',
        name: 'Filesystem Monitor',
        executable: 'filesystem-monitor',
        priority: 'normal',
        autoRestart: true,
      },
    ];

    for (const config of systemProcesses) {
      await this.startProcess(config);
    }
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    this.performanceMonitor = setInterval(() => {
      this.updateProcessStats();
      this.checkResourceLimits();
      this.balanceLoad();
    }, 1000); // Update every second
  }

  /**
   * Start a new process
   */
  async startProcess(config: ProcessConfig): Promise<ProcessInfo> {
    try {
      // Check resource availability
      if (!this.checkResourceAvailability(config)) {
        throw new Error('Insufficient system resources');
      }

      // Check dependencies
      if (config.dependencies) {
        for (const depId of config.dependencies) {
          const depProcess = this.processes.get(depId);
          if (!depProcess || depProcess.status !== 'running') {
            throw new Error(`Dependency ${depId} not available`);
          }
        }
      }

      // Allocate resources
      await this.allocateResources(config);

      // Create process info
      const processInfo: ProcessInfo = {
        id: config.id,
        name: config.name,
        pid: this.generatePID(),
        status: 'running',
        startTime: new Date(),
        cpuUsage: 0,
        memoryUsage: 0,
        threads: 1,
        priority: this.getPriorityValue(config.priority),
        children: [],
        config,
      };

      // Actually start the process (in a real OS, this would spawn/fork)
      await this.spawnProcess(processInfo);

      this.processes.set(config.id, processInfo);

      // Set up auto-restart if configured
      if (config.autoRestart) {
        this.setupAutoRestart(config.id);
      }

      // Notify listeners
      this.notifyProcessEvent('started', config.id, processInfo);

      return processInfo;

    } catch (error) {
      throw new Error(`Failed to start process ${config.name}: ${error}`);
    }
  }

  /**
   * Stop a running process
   */
  async stopProcess(processId: string, force: boolean = false): Promise<void> {
    const process = this.processes.get(processId);
    if (!process) {
      throw new Error(`Process ${processId} not found`);
    }

    try {
      if (force) {
        await this.forceKillProcess(process);
      } else {
        await this.gracefulShutdown(process);
      }

      process.status = 'stopped';
      process.exitCode = 0;

      // Clean up resources
      await this.releaseResources(process);

      // Stop children processes
      for (const childId of process.children) {
        await this.stopProcess(childId, force);
      }

      this.notifyProcessEvent('stopped', processId, process);

    } catch (error) {
      console.error(`Failed to stop process ${processId}:`, error);
      process.status = 'error';
      process.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  /**
   * Pause a running process
   */
  async pauseProcess(processId: string): Promise<void> {
    const process = this.processes.get(processId);
    if (!process || process.status !== 'running') {
      throw new Error(`Process ${processId} is not running`);
    }

    await this.pauseProcessExecution(process);
    process.status = 'paused';

    this.notifyProcessEvent('paused', processId, process);
  }

  /**
   * Resume a paused process
   */
  async resumeProcess(processId: string): Promise<void> {
    const process = this.processes.get(processId);
    if (!process || process.status !== 'paused') {
      throw new Error(`Process ${processId} is not paused`);
    }

    await this.resumeProcessExecution(process);
    process.status = 'running';

    this.notifyProcessEvent('resumed', processId, process);
  }

  /**
   * Send inter-process communication message
   */
  async sendIPCMessage(message: Omit<IPCMessage, 'id' | 'timestamp'>): Promise<void> {
    const ipcMessage: IPCMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date(),
    };

    // Check if recipient exists and is running
    const recipient = this.processes.get(message.to);
    if (!recipient || recipient.status !== 'running') {
      throw new Error(`Recipient process ${message.to} not available`);
    }

    // Add to queue with priority ordering
    this.ipcQueue.push(ipcMessage);
    this.ipcQueue.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Deliver message
    await this.deliverIPCMessage(ipcMessage);
  }

  /**
   * Get process information
   */
  getProcessInfo(processId: string): ProcessInfo | null {
    return this.processes.get(processId) || null;
  }

  /**
   * List all processes
   */
  listProcesses(): ProcessInfo[] {
    return Array.from(this.processes.values());
  }

  /**
   * Get processes by status
   */
  getProcessesByStatus(status: ProcessInfo['status']): ProcessInfo[] {
    return Array.from(this.processes.values()).filter(p => p.status === status);
  }

  /**
   * Get system resource usage
   */
  getSystemResources(): SystemResources {
    return { ...this.systemResources };
  }

  /**
   * Update process priority
   */
  async updateProcessPriority(processId: string, priority: ProcessConfig['priority']): Promise<void> {
    const process = this.processes.get(processId);
    if (!process) {
      throw new Error(`Process ${processId} not found`);
    }

    process.priority = this.getPriorityValue(priority);
    process.config.priority = priority;

    await this.updateSchedulerPriority(process);
    this.notifyProcessEvent('priority-changed', processId, { priority });
  }

  /**
   * Allocate additional resources to a process
   */
  async allocateAdditionalResources(processId: string, resources: {
    cpuCores?: number;
    memory?: number;
  }): Promise<void> {
    const process = this.processes.get(processId);
    if (!process) {
      throw new Error(`Process ${processId} not found`);
    }

    if (resources.cpuCores && !this.checkCpuAvailability(resources.cpuCores)) {
      throw new Error('Insufficient CPU cores available');
    }

    if (resources.memory && !this.checkMemoryAvailability(resources.memory)) {
      throw new Error('Insufficient memory available');
    }

    await this.allocateResourcesToProcess(process, resources);
  }

  /**
   * Create a child process
   */
  async createChildProcess(parentId: string, config: Omit<ProcessConfig, 'id'>): Promise<ProcessInfo> {
    const parent = this.processes.get(parentId);
    if (!parent) {
      throw new Error(`Parent process ${parentId} not found`);
    }

    const childConfig: ProcessConfig = {
      ...config,
      id: `${parentId}-child-${Date.now()}`,
    };

    const childProcess = await this.startProcess(childConfig);

    // Update parent-child relationship
    parent.children.push(childProcess.id);
    childProcess.parentId = parentId;

    return childProcess;
  }

  /**
   * Lock a system resource
   */
  async lockResource(resourceId: string, processId: string): Promise<void> {
    if (this.resourceLocks.has(resourceId)) {
      throw new Error(`Resource ${resourceId} is already locked`);
    }

    const process = this.processes.get(processId);
    if (!process || process.status !== 'running') {
      throw new Error(`Process ${processId} is not running`);
    }

    this.resourceLocks.set(resourceId, processId);
  }

  /**
   * Unlock a system resource
   */
  unlockResource(resourceId: string, processId: string): void {
    const currentLock = this.resourceLocks.get(resourceId);
    if (currentLock !== processId) {
      throw new Error(`Resource ${resourceId} is not locked by process ${processId}`);
    }

    this.resourceLocks.delete(resourceId);
  }

  /**
   * Get process tree (parent-child relationships)
   */
  getProcessTree(): any {
    const processMap = new Map<string, ProcessInfo>();
    const rootProcesses: ProcessInfo[] = [];

    // Create process map
    for (const process of this.processes.values()) {
      processMap.set(process.id, { ...process });
    }

    // Build tree structure
    for (const process of processMap.values()) {
      if (process.parentId) {
        const parent = processMap.get(process.parentId);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(process);
        }
      } else {
        rootProcesses.push(process);
      }
    }

    return { rootProcesses, processMap };
  }

  // Event System
  onProcessEvent(callback: (event: string, processId: string, data?: any) => void): void {
    this.processEventListeners.push(callback);
  }

  removeProcessEventListener(callback: (event: string, processId: string, data?: any) => void): void {
    const index = this.processEventListeners.indexOf(callback);
    if (index > -1) {
      this.processEventListeners.splice(index, 1);
    }
  }

  private notifyProcessEvent(event: string, processId: string, data?: any): void {
    this.processEventListeners.forEach(listener => listener(event, processId, data));
  }

  // Private Helper Methods
  private generatePID(): number {
    // In a real OS, this would be managed by the kernel
    return Math.floor(Math.random() * 100000) + 1000;
  }

  private generateMessageId(): string {
    return `ipc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getPriorityValue(priority: ProcessConfig['priority']): number {
    const priorityMap = { low: 1, normal: 2, high: 3, critical: 4 };
    return priorityMap[priority];
  }

  private getInitialSystemResources(): SystemResources {
    // In a real implementation, this would query the actual system
    const os = require('os');

    return {
      totalCpuCores: os.cpus().length,
      availableCpuCores: os.cpus().length,
      totalMemory: os.totalmem(),
      availableMemory: os.freemem(),
      totalDiskSpace: 1000000000000, // 1TB placeholder
      availableDiskSpace: 500000000000, // 500GB placeholder
      networkInterfaces: this.getNetworkInterfaces(),
    };
  }

  private getNetworkInterfaces(): NetworkInterface[] {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    const result: NetworkInterface[] = [];

    for (const [name, addresses] of Object.entries(interfaces)) {
      if (addresses) {
        for (const addr of addresses) {
          if (addr.family === 'IPv4' && !addr.internal) {
            result.push({
              name,
              address: addr.address,
              netmask: addr.netmask,
              mac: addr.mac,
              rxBytes: 0, // Would need system call
              txBytes: 0, // Would need system call
            });
          }
        }
      }
    }

    return result;
  }

  // Placeholder implementations (would be fully implemented in real OS)
  private async spawnProcess(process: ProcessInfo): Promise<void> {
    // In a real OS, this would actually spawn/fork the process
    console.log(`Spawning process: ${process.name}`);
  }

  private async gracefulShutdown(process: ProcessInfo): Promise<void> {
    // Send SIGTERM and wait for cleanup
    console.log(`Gracefully shutting down: ${process.name}`);
  }

  private async forceKillProcess(process: ProcessInfo): Promise<void> {
    // Send SIGKILL
    console.log(`Force killing process: ${process.name}`);
  }

  private async pauseProcessExecution(process: ProcessInfo): Promise<void> {
    // Send SIGSTOP
    console.log(`Pausing process: ${process.name}`);
  }

  private async resumeProcessExecution(process: ProcessInfo): Promise<void> {
    // Send SIGCONT
    console.log(`Resuming process: ${process.name}`);
  }

  private async deliverIPCMessage(message: IPCMessage): Promise<void> {
    // In a real implementation, this would deliver to the target process
    console.log(`Delivering IPC message to ${message.to}`);
  }

  private setupAutoRestart(processId: string): void {
    // Monitor process and restart if it crashes
    const checkProcess = () => {
      const process = this.processes.get(processId);
      if (process && (process.status === 'terminated' || process.status === 'error')) {
        console.log(`Auto-restarting process: ${processId}`);
        this.startProcess(process.config);
      }
    };

    setInterval(checkProcess, 5000); // Check every 5 seconds
  }

  private checkResourceAvailability(config: ProcessConfig): boolean {
    // Check CPU availability
    if (config.cpuAffinity && config.cpuAffinity.length > this.systemResources.availableCpuCores) {
      return false;
    }

    // Check memory availability
    if (config.memoryLimit && config.memoryLimit > this.systemResources.availableMemory) {
      return false;
    }

    return true;
  }

  private checkCpuAvailability(requestedCores: number): boolean {
    return requestedCores <= this.systemResources.availableCpuCores;
  }

  private checkMemoryAvailability(requestedMemory: number): boolean {
    return requestedMemory <= this.systemResources.availableMemory;
  }

  private async allocateResources(config: ProcessConfig): Promise<void> {
    // Update system resource counters
    if (config.cpuAffinity) {
      this.systemResources.availableCpuCores -= config.cpuAffinity.length;
    }

    if (config.memoryLimit) {
      this.systemResources.availableMemory -= config.memoryLimit;
    }
  }

  private async releaseResources(process: ProcessInfo): Promise<void> {
    // Restore system resources
    if (process.config.cpuAffinity) {
      this.systemResources.availableCpuCores += process.config.cpuAffinity.length;
    }

    if (process.config.memoryLimit) {
      this.systemResources.availableMemory += process.config.memoryLimit;
    }
  }

  private async allocateResourcesToProcess(process: ProcessInfo, resources: any): Promise<void> {
    // Update process resource allocation
    console.log(`Allocating additional resources to ${process.name}`);
  }

  private async updateSchedulerPriority(process: ProcessInfo): Promise<void> {
    // Update process scheduling priority
    console.log(`Updating priority for ${process.name}`);
  }

  private updateProcessStats(): void {
    // Update CPU and memory usage for all processes
    for (const process of this.processes.values()) {
      if (process.status === 'running') {
        // In a real implementation, this would query system stats
        process.cpuUsage = Math.random() * 100; // Placeholder
        process.memoryUsage = Math.random() * 1000000; // Placeholder
      }
    }
  }

  private checkResourceLimits(): void {
    // Check if any processes exceed their resource limits
    for (const process of this.processes.values()) {
      if (process.config.memoryLimit && process.memoryUsage > process.config.memoryLimit) {
        console.warn(`Process ${process.name} exceeded memory limit`);
        this.stopProcess(process.id);
      }

      if (process.config.maxRuntime &&
          Date.now() - process.startTime.getTime() > process.config.maxRuntime) {
        console.warn(`Process ${process.name} exceeded runtime limit`);
        this.stopProcess(process.id);
      }
    }
  }

  private balanceLoad(): void {
    // Balance CPU load across cores using the configured scheduling algorithm
    const runningProcesses = this.getProcessesByStatus('running');

    switch (this.scheduler.algorithm) {
      case 'round-robin':
        // Implement round-robin scheduling
        break;
      case 'priority':
        // Sort by priority and allocate time slices
        runningProcesses.sort((a, b) => b.priority - a.priority);
        break;
      case 'fair-share':
        // Allocate equal time slices to all processes
        break;
      case 'real-time':
        // Priority-based with guaranteed execution times
        break;
    }
  }

  // Cleanup
  dispose(): void {
    if (this.performanceMonitor) {
      clearInterval(this.performanceMonitor);
    }

    // Stop all processes
    for (const process of this.processes.values()) {
      if (process.status === 'running') {
        this.stopProcess(process.id, true);
      }
    }

    this.processes.clear();
    this.ipcQueue = [];
    this.resourceLocks.clear();
    this.processEventListeners = [];
  }
}

/**
 * Factory function to create Process Manager
 */
export function createProcessManager(): ProcessManager {
  return new ProcessManager();
}

/**
 * Default process configuration template
 */
export const defaultProcessConfig: Partial<ProcessConfig> = {
  priority: 'normal',
  autoRestart: false,
  environment: {},
};
