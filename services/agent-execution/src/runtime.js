"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRuntime = void 0;
const executor_1 = require("./executor");
const sandboxExecutor_1 = require("./sandboxExecutor");
const index_1 = require("../../../packages/shared/circuit-breaker/src/index");
const persistence_1 = require("./persistence");
const nanoid_1 = require("nanoid");
const logger_1 = require("./logger");
const index_2 = require("../../../packages/shared/event-bus/src/index");
class AgentRuntime {
    executor;
    active = new Map();
    bus = new index_2.EventBus();
    circuit;
    constructor(bus) {
        if (process.env.SANDBOX_ENABLED === 'true') {
            this.executor = new sandboxExecutor_1.SandboxExecutor();
        }
        else
            this.executor = new executor_1.SimpleExecutor();
        this.circuit = new index_1.CircuitBreaker();
        if (bus)
            this.bus = bus;
    }
    async executeTask(payload) {
        const id = (0, nanoid_1.nanoid)();
        const task = {
            id,
            status: 'pending',
            payload: payload.payload,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            agentId: payload.agentId
        };
        await (0, persistence_1.saveTask)(task);
        logger_1.logger.info({ taskId: id }, 'Saved task, starting execution');
        const promise = (async () => {
            try {
                await (0, persistence_1.updateTask)(id, { status: 'in-progress' });
                this.bus.publish('task.started', { taskId: id, agentId: payload.agentId });
                const result = await this.circuit.execute(() => this.executor.executeTask({
                    id,
                    createdAt: new Date().toISOString(),
                    payload: payload.payload,
                    status: 'in-progress',
                    agentId: payload.agentId
                }));
                await (0, persistence_1.updateTask)(id, {
                    status: result.success ? 'completed' : 'failed'
                });
                this.bus.publish('task.completed', { taskId: id, agentId: payload.agentId, success: result.success });
                return result;
            }
            catch (err) {
                await (0, persistence_1.updateTask)(id, { status: 'failed' });
                return { success: false, error: { message: err.message, stack: err.stack } };
            }
        })();
        this.active.set(id, promise);
        // Remove active after completion
        promise.finally(() => this.active.delete(id));
        return promise;
    }
    getActiveExecutions() {
        return Array.from(this.active.keys());
    }
    async getAgentStatus(agentId) {
        // Minimal implementation: list active tasks owned by agent and return a status.
        const tasks = [];
        for (const [id] of this.active) {
            // We can't fetch task details if we don't store execution metadata; return id only
            tasks.push({ id, agentId });
        }
        return { agentId, state: tasks.length ? 'busy' : 'idle', activeTasks: tasks };
    }
    async cancelTask(taskId) {
        // Cancellation is best-effort in this minimal skeleton;
        await (0, persistence_1.updateTask)(taskId, { status: 'cancelled' });
        logger_1.logger.info({ taskId }, 'Task cancelled');
    }
    async pauseTask(taskId) {
        // Best effort: mark as paused; real pause requires executor cooperation
        await (0, persistence_1.updateTask)(taskId, { status: 'paused' });
    }
    async resumeTask(taskId) {
        const t = await (0, persistence_1.getTask)(taskId);
        if (!t)
            throw new Error('Task not found');
        if (t.status !== 'paused')
            throw new Error('Task not paused');
        await (0, persistence_1.updateTask)(taskId, { status: 'in-progress' });
        // For a resumed task we might re-execute; that behavior is customizable
    }
}
exports.AgentRuntime = AgentRuntime;
//# sourceMappingURL=runtime.js.map