# Azora Spark

**Distributed Data Processing Framework for Azora OS**

Azora Spark is a high-performance distributed data processing framework inspired by Apache Spark, optimized for Azora's ingestion engines and infrastructure.

## Features

- **Distributed Processing**: Process large datasets across multiple executors
- **Ingestion Engine Integration**: Seamlessly integrate with Kafka, Redis, Database, Files, S3, APIs, and more
- **Real-time Streaming**: Process streaming data with low latency
- **DataFrame API**: High-level API for structured data operations
- **RDD Operations**: Resilient Distributed Datasets with map, filter, reduce operations
- **Cluster Management**: Automatic resource allocation and job scheduling

## Quick Start

### Installation

```bash
cd services/azora-spark
npm install
```

### Start Service

```bash
npm start
# or
node index.ts
```

### Initialize Spark Context

```bash
curl -X POST http://localhost:4301/spark/init \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "my-spark-app",
    "master": "local[*]",
    "executorMemory": "2g",
    "numExecutors": 4
  }'
```

### Ingest Data from Kafka

```bash
curl -X POST http://localhost:4301/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "type": "kafka",
    "config": {
      "topic": "analytics-events",
      "brokers": ["localhost:9092"],
      "groupId": "azora-spark-group",
      "batchSize": 1000
    }
  }'
```

### Process RDD

```bash
curl -X POST http://localhost:4301/rdd/process \
  -H "Content-Type: application/json" \
  -d '{
    "data": [1, 2, 3, 4, 5],
    "operations": [
      {"type": "map", "function": "x => x * 2"},
      {"type": "filter", "function": "x => x > 5"},
      {"type": "count"}
    ]
  }'
```

## Architecture

```
┌─────────────────────────────────────────┐
│         Azora Spark Service             │
├─────────────────────────────────────────┤
│  Spark Context                          │
│  ├── Master Node                        │
│  └── Executor Nodes                     │
├─────────────────────────────────────────┤
│  Ingestion Engines                      │
│  ├── Kafka                              │
│  ├── Redis                              │
│  ├── Database                           │
│  ├── File System                        │
│  ├── S3                                 │
│  └── API                                │
├─────────────────────────────────────────┤
│  Processing APIs                        │
│  ├── RDD API                            │
│  ├── DataFrame API                      │
│  └── Streaming API                      │
└─────────────────────────────────────────┘
```

## Integration with Azora Services

Azora Spark integrates seamlessly with:

- **Analytics Service**: Process analytics events in real-time
- **Azora Nexus**: Distributed data processing across services
- **Azora Sapiens**: Educational data processing and insights
- **Azora Aegis**: Security event processing

## API Reference

### Spark Context

- `POST /spark/init` - Initialize Spark context
- `POST /spark/stop` - Stop Spark context
- `GET /cluster/status` - Get cluster status

### Ingestion

- `POST /ingest` - Ingest data from any supported engine

### Processing

- `POST /rdd/process` - Process data using RDD operations
- `POST /dataframe/create` - Create and process DataFrame
- `POST /streaming/start` - Start streaming processing

## Configuration

Environment variables:

- `AZORA_SPARK_PORT` - Service port (default: 4301)
- `REDIS_URL` - Redis connection URL
- `KAFKA_BROKERS` - Kafka broker addresses

## License

AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
