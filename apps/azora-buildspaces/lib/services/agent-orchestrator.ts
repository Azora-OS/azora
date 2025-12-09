import { ConstitutionalCore } from "./constitutional-core"

export type AgentRole = 'manager' | 'architect' | 'engineer' | 'designer'

export interface AgentTask {
    id: string
    description: string
    assignedTo: AgentRole
    status: 'pending' | 'in-progress' | 'review' | 'completed' | 'failed'
    output?: string
}

export class AgentOrchestrator {
    private static instance: AgentOrchestrator
    private constitution: ConstitutionalCore
    private tasks: Map<string, AgentTask> = new Map()

    private constructor() {
        this.constitution = ConstitutionalCore.getInstance()
    }

    public static getInstance(): AgentOrchestrator {
        if (!AgentOrchestrator.instance) {
            AgentOrchestrator.instance = new AgentOrchestrator()
        }
        return AgentOrchestrator.instance
    }

    public async createTask(description: string, role: AgentRole): Promise<AgentTask> {
        // 1. Constitutional Check
        const verdict = await this.constitution.evaluateAction(`Create task for ${role}: ${description}`, "orchestrator")

        if (!verdict.approved) {
            throw new Error(`Task rejected by Constitution: ${verdict.reasoning}`)
        }

        // 2. Create Task
        const task: AgentTask = {
            id: `TASK-${Date.now()}`,
            description,
            assignedTo: role,
            status: 'pending'
        }

        this.tasks.set(task.id, task)
        return task
    }

    public async executeTask(taskId: string): Promise<void> {
        const task = this.tasks.get(taskId)
        if (!task) { throw new Error("Task not found") }

        task.status = 'in-progress'
        // console.log(`[Orchestrator] Agent ${task.assignedTo} starting task: ${task.description}`)

        // Simulate execution delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        task.output = `Generated output for: ${task.description}`
        task.status = 'review'
        // console.log(`[Orchestrator] Task ${taskId} moved to review`)
    }
}
