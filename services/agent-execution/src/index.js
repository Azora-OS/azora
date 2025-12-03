"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const runtime_1 = require("./runtime");
const index_1 = require("../../packages/shared/health/src/index");
const persistence_1 = require("./persistence");
const logger_1 = require("./logger");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use('/ui', express_1.default.static(path.resolve(process.cwd(), 'static')));
const runtime = new runtime_1.AgentRuntime();
const health = new index_1.HealthService();
health.registerHealthCheck('agent-execution', async () => ({
    serviceId: 'agent-execution',
    status: 'healthy',
    lastCheckedAt: new Date().toISOString()
}));
app.post('/execute', async (req, res) => {
    try {
        const payload = req.body;
        const result = await runtime.executeTask(payload);
        res.json(result);
    }
    catch (err) {
        logger_1.logger.error({ err }, 'Execute error');
        res.status(500).json({ error: err.message });
    }
});
app.get('/task/:id', async (req, res) => {
    const id = req.params.id;
    const task = await (0, persistence_1.getTask)(id);
    res.json(task);
});
app.get('/tasks', async (req, res) => {
    try {
        // For demo: expose in-memory tasks
        const tasks = [];
        const store = require('./persistence').inMemoryTaskStore;
        for (const t of store.values())
            tasks.push(t);
        res.json({ tasks });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/task/:id/cancel', async (req, res) => {
    const id = req.params.id;
    try {
        await runtime.cancelTask(id);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/task/:id/pause', async (req, res) => {
    const id = req.params.id;
    try {
        await runtime.pauseTask(id);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/task/:id/resume', async (req, res) => {
    const id = req.params.id;
    try {
        await runtime.resumeTask(id);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
const port = process.env.PORT ?? 4002;
app.listen(port, () => {
    logger_1.logger.info({ port }, 'Agent Execution service started');
});
app.get('/health', async (req, res) => {
    const checks = await health.runChecks();
    const unhealthy = checks.filter(c => c.status !== 'healthy');
    res.status(unhealthy.length ? 503 : 200).json({ checks });
});
app.get('/executions', async (req, res) => {
    try {
        const ids = runtime.getActiveExecutions();
        res.json({ active: ids });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/agents/:id/status', async (req, res) => {
    const id = req.params.id;
    try {
        const status = await runtime.getAgentStatus(id);
        res.json(status);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
//# sourceMappingURL=index.js.map