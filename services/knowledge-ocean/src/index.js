"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const fileWatcher_1 = require("./fileWatcher");
const indexer_1 = require("./indexer");
const aiRouter_1 = require("./aiRouter");
const logger_1 = require("./logger");
const auth_1 = require("./middleware/auth");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
const indexer = new indexer_1.DatabaseIndexer();
const ai = new aiRouter_1.AIProviderRouter();
const workspacePath = process.env.WORKSPACE_PATH ?? path_1.default.resolve(process.cwd());
const watcher = new fileWatcher_1.FileWatcher(workspacePath, async (nodes) => {
    for (const n of nodes) {
        n.embedding = await ai.embedText(n.content);
    }
    await indexer.indexNodes(nodes);
});
watcher.start();
app.get('/search', async (req, res) => {
    const q = req.query.q;
    if (!q)
        return res.status(400).json({ error: 'q required' });
    const results = await indexer.search(q, 10);
    res.json(results);
});
// Accept content nodes for indexing (from VSCode extension or other sources)
app.post('/index', (0, auth_1.apiKeyOrJwtAuth)(true), async (req, res) => {
    const apiKeyHeader = req.headers['x-api-key'] || req.headers['authorization'];
    const indexApiKey = process.env.INDEX_API_KEY;
    if (indexApiKey && (!apiKeyHeader || (apiKeyHeader !== `Bearer ${indexApiKey}` && apiKeyHeader !== indexApiKey))) {
        return res.status(401).json({ error: 'unauthorized' });
    }
    const nodes = req.body;
    if (!Array.isArray(nodes) || nodes.length === 0)
        return res.status(400).json({ error: 'nodes array required' });
    // Validate nodes - each should have id & content at least
    for (const n of nodes) {
        if (!n.id)
            return res.status(400).json({ error: 'node id required' });
        if (!n.content)
            return res.status(400).json({ error: 'node content required' });
    }
    try {
        for (const n of nodes) {
            if (!n.embedding)
                n.embedding = await ai.embedText(n.content);
        }
        await indexer.indexNodes(nodes);
        res.status(200).json({ success: true, count: nodes.length });
    }
    catch (err) {
        logger_1.logger.error({ err }, 'Indexing failed');
        res.status(500).json({ error: 'indexing failed' });
    }
});
const port = process.env.PORT ?? 4003;
app.listen(port, () => {
    logger_1.logger.info({ port }, 'Knowledge Ocean service started');
});
//# sourceMappingURL=index.js.map