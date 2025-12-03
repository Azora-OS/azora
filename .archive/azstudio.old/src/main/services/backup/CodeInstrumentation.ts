/**
 * Code Instrumentation Service
 * 
 * Automatically adds logging, metrics collection, distributed tracing,
 * and custom events to generated code.
 */

import { Project, SourceFile, SyntaxKind, ts } from 'ts-morph';

export interface InstrumentationConfig {
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    provider: 'winston' | 'pino' | 'console';
  };
  metrics: {
    enabled: boolean;
    provider: 'prometheus' | 'statsd' | 'datadog';
    customMetrics: string[];
  };
  tracing: {
    enabled: boolean;
    provider: 'opentelemetry' | 'jaeger' | 'zipkin';
    sampleRate: number;
  };
  events: {
    enabled: boolean;
    customEvents: string[];
  };
}

export interface InstrumentationResult {
  instrumentedCode: string;
  addedImports: string[];
  addedMiddleware: string[];
  metricsEndpoint?: string;
}

export class CodeInstrumentation {
  private project: Project;
  private config: InstrumentationConfig;

  constructor(config: InstrumentationConfig) {
    this.project = new Project();
    this.config = config;
  }

  /**
   * Instrument Express service code with logging, metrics, and tracing
   */
  async instrumentService(code: string, serviceName: string): Promise<InstrumentationResult> {
    const sourceFile = this.project.createSourceFile('temp.ts', code, { overwrite: true });
    const addedImports: string[] = [];
    const addedMiddleware: string[] = [];

    // Add logging instrumentation
    if (this.config.logging.enabled) {
      this.addLoggingInstrumentation(sourceFile, serviceName);
      addedImports.push(this.getLoggingImport());
    }

    // Add metrics instrumentation
    if (this.config.metrics.enabled) {
      this.addMetricsInstrumentation(sourceFile, serviceName);
      addedImports.push(this.getMetricsImport());
      addedMiddleware.push('metricsMiddleware');
    }

    // Add distributed tracing
    if (this.config.tracing.enabled) {
      this.addTracingInstrumentation(sourceFile, serviceName);
      addedImports.push(this.getTracingImport());
      addedMiddleware.push('tracingMiddleware');
    }

    // Add custom event tracking
    if (this.config.events.enabled) {
      this.addEventInstrumentation(sourceFile);
      addedImports.push(this.getEventsImport());
    }

    const instrumentedCode = sourceFile.getFullText();
    
    return {
      instrumentedCode,
      addedImports,
      addedMiddleware,
      metricsEndpoint: this.config.metrics.enabled ? '/metrics' : undefined,
    };
  }

  /**
   * Add logging to route handlers and service methods
   */
  private addLoggingInstrumentation(sourceFile: SourceFile, serviceName: string): void {
    // Find all function declarations and arrow functions
    const functions = sourceFile.getFunctions();
    const methods = sourceFile.getClasses().flatMap(cls => cls.getMethods());

    [...functions, ...methods].forEach(func => {
      const funcName = func.getName() || 'anonymous';
      const body = func.getBody();

      if (body && ts.isBlock(body.compilerNode)) {
        // Add logging at function entry
        const entryLog = this.generateLogStatement(
          'info',
          `[${serviceName}] Entering ${funcName}`,
          { function: funcName }
        );

        func.insertStatements(0, entryLog);

        // Add error logging in catch blocks
        func.getDescendantsOfKind(SyntaxKind.CatchClause).forEach(catchClause => {
          const errorVar = catchClause.getVariableDeclaration()?.getName() || 'error';
          const errorLog = this.generateLogStatement(
            'error',
            `[${serviceName}] Error in ${funcName}`,
            { function: funcName, error: `${errorVar}.message`, stack: `${errorVar}.stack` }
          );
          catchClause.getBlock().insertStatements(0, errorLog);
        });
      }
    });
  }

  /**
   * Add metrics collection for API endpoints
   */
  private addMetricsInstrumentation(sourceFile: SourceFile, serviceName: string): void {
    // Find Express route handlers (app.get, app.post, etc.)
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    // Filter first to avoid iterating over nodes that might be removed when parents are modified
    const routeHandlers = callExpressions.filter(call => {
      try {
        const expression = call.getExpression();
        const expressionText = expression.getText();
        return !!expressionText.match(/app\.(get|post|put|delete|patch)/);
      } catch (e) {
        return false;
      }
    });

    routeHandlers.forEach(call => {
      // Double check it wasn't removed (redundant but safe)
      if (call.wasForgotten()) return;

      const args = call.getArguments();
      if (args.length >= 2) {
        const route = args[0].getText().replace(/['"]/g, '');
        const handler = args[args.length - 1];

        // Wrap handler with metrics collection
        if (ts.isArrowFunction(handler.compilerNode) || ts.isFunctionExpression(handler.compilerNode)) {
          const metricsWrapper = this.generateMetricsWrapper(serviceName, route);
          handler.replaceWithText(metricsWrapper);
        }
      }
    });
  }

  /**
   * Add distributed tracing spans
   */
  private addTracingInstrumentation(sourceFile: SourceFile, serviceName: string): void {
    const functions = sourceFile.getFunctions();
    const methods = sourceFile.getClasses().flatMap(cls => cls.getMethods());

    [...functions, ...methods].forEach(func => {
      const funcName = func.getName() || 'anonymous';
      const body = func.getBody();

      if (body && ts.isBlock(body.compilerNode)) {
        // Wrap function body in tracing span
        const spanStart = `const span = tracer.startSpan('${serviceName}.${funcName}');`;
        const spanEnd = `span.end();`;

        func.insertStatements(0, spanStart);
        
        // Add span.end() before all return statements
        func.getDescendantsOfKind(SyntaxKind.ReturnStatement).forEach(returnStmt => {
          returnStmt.replaceWithText(`${spanEnd}\n${returnStmt.getText()}`);
        });

        // Add span.end() in finally blocks
        func.getDescendantsOfKind(SyntaxKind.TryStatement).forEach(tryStmt => {
          const finallyBlock = tryStmt.getFinallyBlock();
          if (finallyBlock) {
            finallyBlock.insertStatements(0, spanEnd);
          } else {
            // Fallback if addFinallyBlock is not available or logic is simpler with text replacement
            const text = tryStmt.getText();
            tryStmt.replaceWithText(`${text} finally { ${spanEnd} }`);
          }
        });
      }
    });
  }

  /**
   * Add custom event tracking
   */
  private addEventInstrumentation(sourceFile: SourceFile): void {
    // Add event tracking for specific patterns
    this.config.events.customEvents.forEach(eventPattern => {
      // 1. Instrument function declarations with matching name
      const functions = sourceFile.getFunctions();
      const methods = sourceFile.getClasses().flatMap(cls => cls.getMethods());
      
      [...functions, ...methods].forEach(func => {
        if (func.getName() === eventPattern) {
          const eventLog = `analytics.track('${eventPattern}', { timestamp: Date.now() });`;
          func.insertStatements(0, eventLog);
        }
      });

      // 2. Instrument function calls matching the event pattern
      const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
      
      callExpressions.forEach(call => {
        const expression = call.getExpression();
        if (expression.getText().includes(eventPattern)) {
          const eventLog = `analytics.track('${eventPattern}', { timestamp: Date.now() });`;
          
          const statement = call.getFirstAncestorByKind(SyntaxKind.ExpressionStatement);
          if (statement) {
            const parent = statement.getParent();
            // Check if parent supports inserting statements (e.g., Block, SourceFile)
            if (parent && (parent.getKind() === SyntaxKind.Block || parent.getKind() === SyntaxKind.SourceFile)) {
               // Cast to any to access insertStatements safely in this context
               (parent as any).insertStatements(statement.getChildIndex(), eventLog);
            }
          }
        }
      });
    });
  }

  /**
   * Generate logging statement
   */
  private generateLogStatement(level: string, message: string, context: Record<string, string>): string {
    const contextStr = Object.entries(context)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    switch (this.config.logging.provider) {
      case 'winston':
        return `logger.${level}('${message}', { ${contextStr} });`;
      case 'pino':
        return `logger.${level}({ ${contextStr} }, '${message}');`;
      case 'console':
      default:
        return `console.${level}('${message}', { ${contextStr} });`;
    }
  }

  /**
   * Generate metrics wrapper for route handlers
   */
  private generateMetricsWrapper(serviceName: string, route: string): string {
    return `async (req, res, next) => {
      const startTime = Date.now();
      const metricLabels = { service: '${serviceName}', route: '${route}', method: req.method };
      
      metrics.increment('http_requests_total', metricLabels);
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        metrics.histogram('http_request_duration_ms', duration, metricLabels);
        metrics.increment('http_responses_total', { ...metricLabels, status: res.statusCode });
      });
      
      try {
        await next();
      } catch (error) {
        metrics.increment('http_errors_total', metricLabels);
        throw error;
      }
    }`;
  }

  /**
   * Get logging import statement
   */
  private getLoggingImport(): string {
    switch (this.config.logging.provider) {
      case 'winston':
        return "import { logger } from './utils/logger';";
      case 'pino':
        return "import pino from 'pino';\nconst logger = pino();";
      case 'console':
      default:
        return '';
    }
  }

  /**
   * Get metrics import statement
   */
  private getMetricsImport(): string {
    switch (this.config.metrics.provider) {
      case 'prometheus':
        return "import { metrics } from './utils/metrics';";
      case 'statsd':
        return "import StatsD from 'node-statsd';\nconst metrics = new StatsD();";
      case 'datadog':
        return "import { StatsD } from 'hot-shots';\nconst metrics = new StatsD();";
      default:
        return "import { metrics } from './utils/metrics';";
    }
  }

  /**
   * Get tracing import statement
   */
  private getTracingImport(): string {
    switch (this.config.tracing.provider) {
      case 'opentelemetry':
        return "import { trace } from '@opentelemetry/api';\nconst tracer = trace.getTracer('default');";
      case 'jaeger':
        return "import { initTracer } from 'jaeger-client';\nconst tracer = initTracer(config, {});";
      case 'zipkin':
        return "import { Tracer } from 'zipkin';\nconst tracer = new Tracer({});";
      default:
        return "import { tracer } from './utils/tracing';";
    }
  }

  /**
   * Get events import statement
   */
  private getEventsImport(): string {
    return "import { analytics } from './utils/analytics';";
  }

  /**
   * Generate monitoring utilities
   */
  generateMonitoringUtils(): Record<string, string> {
    const utils: Record<string, string> = {};

    if (this.config.logging.enabled) {
      utils['utils/logger.ts'] = this.generateLoggerUtil();
    }

    if (this.config.metrics.enabled) {
      utils['utils/metrics.ts'] = this.generateMetricsUtil();
    }

    if (this.config.tracing.enabled) {
      utils['utils/tracing.ts'] = this.generateTracingUtil();
    }

    if (this.config.events.enabled) {
      utils['utils/analytics.ts'] = this.generateAnalyticsUtil();
    }

    return utils;
  }

  private generateLoggerUtil(): string {
    return `import winston from 'winston';

export const logger = winston.createLogger({
  level: '${this.config.logging.level}',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
`;
  }

  private generateMetricsUtil(): string {
    return `import { Registry, Counter, Histogram, Gauge } from 'prom-client';

const register = new Registry();

export const metrics = {
  increment: (name: string, labels?: Record<string, any>) => {
    const counter = new Counter({ name, help: name, labelNames: Object.keys(labels || {}), registers: [register] });
    counter.inc(labels);
  },
  
  histogram: (name: string, value: number, labels?: Record<string, any>) => {
    const histogram = new Histogram({ name, help: name, labelNames: Object.keys(labels || {}), registers: [register] });
    histogram.observe(labels, value);
  },
  
  gauge: (name: string, value: number, labels?: Record<string, any>) => {
    const gauge = new Gauge({ name, help: name, labelNames: Object.keys(labels || {}), registers: [register] });
    gauge.set(labels, value);
  },
  
  getMetrics: () => register.metrics(),
};

export { register };
`;
  }

  private generateTracingUtil(): string {
    return `import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { trace } from '@opentelemetry/api';

const provider = new NodeTracerProvider();
const exporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

export const tracer = trace.getTracer('azstudio-service');
`;
  }

  private generateAnalyticsUtil(): string {
    return `export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    console.log('[Analytics]', event, properties);
    // Integrate with analytics provider (Segment, Mixpanel, etc.)
  },
  
  identify: (userId: string, traits?: Record<string, any>) => {
    console.log('[Analytics] Identify', userId, traits);
  },
  
  page: (name: string, properties?: Record<string, any>) => {
    console.log('[Analytics] Page', name, properties);
  },
};
`;
  }
}
