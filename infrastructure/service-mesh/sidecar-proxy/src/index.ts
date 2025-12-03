import http from 'http';
import httpProxy from 'http-proxy';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

const proxy = httpProxy.createProxyServer({});
const TARGET_PORT = process.env.TARGET_PORT || 3000;
const PROXY_PORT = process.env.PROXY_PORT || 4000;
const SERVICE_NAME = process.env.SERVICE_NAME || 'unknown-service';

const server = http.createServer((req, res) => {
    // Distributed Tracing
    const traceId = req.headers['x-trace-id'] || uuidv4();
    const spanId = uuidv4();
    const parentSpanId = req.headers['x-span-id'];

    req.headers['x-trace-id'] = traceId;
    req.headers['x-span-id'] = spanId;
    if (parentSpanId) {
        req.headers['x-parent-span-id'] = parentSpanId as string;
    }

    // mTLS Simulation (Check for client cert header - simplified)
    // In real mTLS, this is handled by the TLS handshake
    const clientCert = req.headers['x-client-cert'];
    if (process.env.MTLS_ENABLED === 'true' && !clientCert) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'mTLS certificate required' }));
        return;
    }

    logger.info(`Forwarding request to ${SERVICE_NAME}`, {
        traceId,
        spanId,
        method: req.method,
        url: req.url
    });

    proxy.web(req, res, { target: `http://localhost:${TARGET_PORT}` }, (err) => {
        logger.error(`Proxy error: ${err.message}`, { traceId });
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad Gateway' }));
    });
});

server.listen(PROXY_PORT, () => {
    console.log(`🕸️ Service Mesh Sidecar for ${SERVICE_NAME} running on port ${PROXY_PORT} -> target ${TARGET_PORT}`);
});
