import { prisma, io } from '../index';
import { AgentTask, AgentTaskStatus } from '@prisma/client';

const AGENT_SPEED_MS = 5000; // 5 seconds per "tick"

export class AgentLoop {
    private isRunning = false;

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('🚀 Agent Execution Loop Started');
        this.loop();
    }

    stop() {
        this.isRunning = false;
        console.log('🛑 Agent Execution Loop Stopped');
    }

    private async loop() {
        while (this.isRunning) {
            try {
                await this.processPendingTasks();
                await this.processActiveTasks();
            } catch (error) {
                console.error('Error in Agent Loop:', error);
            }
            await new Promise(resolve => setTimeout(resolve, AGENT_SPEED_MS));
        }
    }

    private async processPendingTasks() {
        // Find tasks that are pending and assign them to agents if they are free
        // For simplicity, we'll just pick up the first pending task
        const pendingTasks = await prisma.agentTask.findMany({
            where: { status: 'PENDING' },
            take: 5,
            orderBy: { priority: 'desc' }
        });

        for (const task of pendingTasks) {
            // "Assign" and start processing
            await prisma.agentTask.update({
                where: { id: task.id },
                data: { status: 'PROCESSING', startedAt: new Date() }
            });

            this.broadcast(task.projectId, 'task:update', {
                taskId: task.id,
                status: 'PROCESSING',
                agentName: task.agentName
            });

            this.broadcast(task.projectId, 'agent:status-update', {
                agentName: task.agentName,
                status: 'working',
                currentTask: task.title
            });

            console.log(`[${task.agentName}] Started task: ${task.title}`);
        }
    }

    private async processActiveTasks() {
        // Find tasks that are currently processing
        const activeTasks = await prisma.agentTask.findMany({
            where: { status: 'PROCESSING' },
            take: 10
        });

        for (const task of activeTasks) {
            // Simulate work: 20% chance to complete, 10% chance to log update
            const roll = Math.random();

            if (roll < 0.2) {
                // Complete Task
                await prisma.agentTask.update({
                    where: { id: task.id },
                    data: { status: 'COMPLETED', completedAt: new Date() }
                });

                this.broadcast(task.projectId, 'task:update', {
                    taskId: task.id,
                    status: 'COMPLETED',
                    agentName: task.agentName
                });

                this.broadcast(task.projectId, 'agent:status-update', {
                    agentName: task.agentName,
                    status: 'active', // Return to active/idle
                    currentTask: null
                });

                this.broadcast(task.projectId, 'agent:activity', {
                    agentName: task.agentName,
                    action: 'complete_task',
                    details: `Completed task: ${task.title}`,
                    file: 'N/A'
                });

                console.log(`[${task.agentName}] Completed task: ${task.title}`);

            } else if (roll < 0.5) {
                // Log progress / Activity
                const activities = [
                    "Analyzing dependencies...",
                    "Optimizing code structure...",
                    "Running security scans...",
                    "Updating documentation...",
                    "Refactoring components...",
                    "Validating schema...",
                    "Running unit tests..."
                ];
                const activity = activities[Math.floor(Math.random() * activities.length)];

                this.broadcast(task.projectId, 'agent:activity', {
                    agentName: task.agentName,
                    action: 'progress',
                    details: activity,
                    file: 'main.ts' // Mock file
                });

                // Simulate cursor movement
                this.broadcast(task.projectId, 'agent:cursor', {
                    agentName: task.agentName,
                    file: 'main.ts',
                    line: Math.floor(Math.random() * 50) + 1,
                    column: Math.floor(Math.random() * 80),
                    label: 'working'
                });
            }
        }
    }

    private broadcast(projectId: string, event: string, data: any) {
        io.to(projectId).emit(event, data);
        // Also broadcast to global room for dashboard if needed
        io.emit(event, data);
    }
}

export const agentLoop = new AgentLoop();
