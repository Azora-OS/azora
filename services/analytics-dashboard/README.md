# Analytics Dashboard Service

A comprehensive analytics dashboard service for the Azora ecosystem.

## Features

- **Real-time Metrics**: Track key performance indicators in real-time
- **Report Generation**: Generate detailed analytics reports
- **Data Visualization**: Create charts and graphs for data representation
- **Custom Metrics**: Define and track custom metrics
- **RESTful API**: Well-documented API endpoints for all analytics functions

## API Endpoints

### Health & Info
- `GET /health` - Service health check

### Metrics
- `GET /api/metrics` - Get all dashboard metrics
- `GET /api/metrics/:metricType` - Get specific metric
- `PUT /api/metrics/:metricType` - Update specific metric

### Reports
- `POST /api/reports` - Generate a new report
- `GET /api/reports` - Get all reports
- `GET /api/reports/:reportId` - Get specific report

### Visualizations
- `GET /api/visualizations/:type` - Generate a new visualization
- `GET /api/visualizations` - Get all visualizations

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the service:
   ```bash
   npm start
   ```

3. For development:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=3033
LOG_LEVEL=info
```

## Metrics Types

The service supports tracking various types of metrics:

1. **User Metrics**: Track user engagement, growth, and activity
2. **Revenue Metrics**: Monitor financial performance and revenue streams
3. **Engagement Metrics**: Measure user interaction and retention
4. **Performance Metrics**: Track system performance and reliability

## Report Types

The service can generate different types of reports:

1. **User Engagement Reports**: Detailed analysis of user behavior
2. **Revenue Reports**: Financial performance analysis
3. **Performance Reports**: System performance and reliability metrics

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

PROPRIETARY
