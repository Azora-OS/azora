const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
        // Jaeger OTLP HTTP endpoint
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    }),
    instrumentations: [getNodeAutoInstrumentations()],
    serviceName: 'azora-api-gateway',
});

// Start the SDK
try {
    sdk.start();
    console.log('🔭 OpenTelemetry initialized for azora-api-gateway');
} catch (error) {
    console.error('Failed to initialize OpenTelemetry:', error);
}

// Graceful shutdown
process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
});
