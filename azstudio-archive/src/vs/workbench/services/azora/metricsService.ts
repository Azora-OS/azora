export interface MetricsSnapshot {
  ingestion: { successCount: number; failureCount: number; avgLatencyMs: number };
  streaming: { sessions: number; chunks: number; failures: number };
}

export class MetricsService {
  private ingestionSuccess = 0;
  private ingestionFailure = 0;
  private ingestionLatencyTotal = 0; // ms
  private ingestionCount = 0;

  private streamingSessions = 0;
  private streamingChunks = 0;
  private streamingFailures = 0;

  recordIngestionSuccess(latencyMs: number) {
    this.ingestionSuccess++;
    this.ingestionCount++;
    this.ingestionLatencyTotal += latencyMs;
  }
  recordIngestionFailure(latencyMs: number) {
    this.ingestionFailure++;
    this.ingestionCount++;
    this.ingestionLatencyTotal += latencyMs;
  }

  recordStreamingSessionStart() { this.streamingSessions++; }
  recordStreamingChunk() { this.streamingChunks++; }
  recordStreamingFailure() { this.streamingFailures++; }

  snapshot(): MetricsSnapshot {
    return {
      ingestion: {
        successCount: this.ingestionSuccess,
        failureCount: this.ingestionFailure,
        avgLatencyMs: this.ingestionCount === 0 ? 0 : Math.round(this.ingestionLatencyTotal / this.ingestionCount),
      },
      streaming: {
        sessions: this.streamingSessions,
        chunks: this.streamingChunks,
        failures: this.streamingFailures,
      },
    };
  }
}

const globalMetricsService = new MetricsService();
export function getMetricsService(): MetricsService { return globalMetricsService; }
export default MetricsService;
