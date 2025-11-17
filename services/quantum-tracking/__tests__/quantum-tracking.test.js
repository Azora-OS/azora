const quantumTrackingService = require('../index');

describe('Quantum Tracking Service', () => {
  const userId = 'test-user-123';

  beforeEach(() => {
    // Clear data before each test
    quantumTrackingService.trackingData.clear();
    quantumTrackingService.quantumEvents = [];
    quantumTrackingService.predictiveModels.clear();
  });

  test('should track quantum events', () => {
    const eventType = 'learning_engagement';
    const data = { courseId: 'course_algebra_101', timeSpent: 1200 };

    const quantumEvent = quantumTrackingService.trackQuantumEvent(userId, eventType, data);

    expect(quantumEvent).toBeDefined();
    expect(quantumEvent.id).toBeDefined();
    expect(quantumEvent.userId).toBe(userId);
    expect(quantumEvent.eventType).toBe(eventType);
    expect(quantumEvent.data).toEqual(data);
    expect(quantumEvent.quantumState).toBeDefined();
    expect(quantumEvent.predictiveInsights).toBeDefined();

    // Verify data was stored
    expect(quantumTrackingService.trackingData.has(userId)).toBe(true);
    expect(quantumTrackingService.trackingData.get(userId)).toHaveLength(1);
  });

  test('should generate quantum state', () => {
    const quantumState = quantumTrackingService.generateQuantumState();

    expect(quantumState).toBeDefined();
    expect(typeof quantumState.superposition).toBe('boolean');
    expect(typeof quantumState.entanglement).toBe('number');
    expect(typeof quantumState.coherence).toBe('number');
    expect(typeof quantumState.uncertainty).toBe('number');
    expect(quantumState.waveFunction).toBeDefined();
    expect(typeof quantumState.waveFunction.amplitude).toBe('number');
    expect(typeof quantumState.waveFunction.phase).toBe('number');
  });

  test('should generate predictive insights', () => {
    const eventType = 'learning_engagement';
    const data = { courseId: 'course_algebra_101' };

    const insights = quantumTrackingService.generatePredictiveInsights(eventType, data);

    expect(insights).toBeDefined();
    expect(typeof insights.probability).toBe('number');
    expect(typeof insights.confidence).toBe('number');
    expect(typeof insights.timeline).toBe('number');
    expect(Array.isArray(insights.recommendations)).toBe(true);
    expect(insights.recommendations.length).toBeGreaterThan(0);
  });

  test('should get user tracking data', () => {
    // Add some test events
    quantumTrackingService.trackQuantumEvent(userId, 'learning_engagement', { courseId: 'course1' });
    quantumTrackingService.trackQuantumEvent(userId, 'financial_behavior', { transactionId: 'tx1' });
    quantumTrackingService.trackQuantumEvent('other-user', 'social_interaction', { interactionId: 'int1' });

    const trackingData = quantumTrackingService.getUserTrackingData(userId);

    expect(trackingData.events).toHaveLength(2);
    expect(trackingData.total).toBe(2);
    expect(trackingData.events.every(event => event.userId === userId)).toBe(true);
  });

  test('should filter user tracking data by event type', () => {
    // Add some test events
    quantumTrackingService.trackQuantumEvent(userId, 'learning_engagement', { courseId: 'course1' });
    quantumTrackingService.trackQuantumEvent(userId, 'financial_behavior', { transactionId: 'tx1' });

    const filteredData = quantumTrackingService.getUserTrackingData(userId, { eventType: 'learning_engagement' });

    expect(filteredData.events).toHaveLength(1);
    expect(filteredData.events[0].eventType).toBe('learning_engagement');
  });

  test('should get quantum analytics', () => {
    // Add some test events
    quantumTrackingService.trackQuantumEvent(userId, 'learning_engagement', { courseId: 'course1' });
    quantumTrackingService.trackQuantumEvent(userId, 'financial_behavior', { transactionId: 'tx1' });

    const analytics = quantumTrackingService.getQuantumAnalytics(userId);

    expect(analytics).toBeDefined();
    expect(analytics.totalEvents).toBe(2);
    expect(analytics.eventTypes).toBeDefined();
    expect(analytics.quantumMetrics).toBeDefined();
    expect(typeof analytics.predictiveAccuracy).toBe('number');
    expect(Array.isArray(analytics.insights)).toBe(true);
  });

  test('should train predictive model', () => {
    const modelId = 'test-model';
    const trainingData = [{ userId: 'user1', score: 0.8 }];

    const model = quantumTrackingService.trainPredictiveModel(modelId, trainingData);

    expect(model).toBeDefined();
    expect(model.id).toBe(modelId);
    expect(model.trainedAt).toBeDefined();
    expect(typeof model.accuracy).toBe('number');
    expect(model.parameters).toBeDefined();
    expect(Array.isArray(model.predictions)).toBe(true);

    // Verify model was stored
    expect(quantumTrackingService.predictiveModels.has(modelId)).toBe(true);
  });

  test('should make prediction', () => {
    const modelId = 'test-model';
    const inputData = { userId: 'user1', currentScore: 0.7 };

    // First train a model
    quantumTrackingService.trainPredictiveModel(modelId, [{ userId: 'user1', score: 0.8 }]);

    const prediction = quantumTrackingService.makePrediction(modelId, inputData);

    expect(prediction).toBeDefined();
    expect(prediction.modelId).toBe(modelId);
    expect(prediction.input).toEqual(inputData);
    expect(prediction.output).toBeDefined();
    expect(prediction.timestamp).toBeDefined();

    // Verify prediction was stored in model
    const model = quantumTrackingService.predictiveModels.get(modelId);
    expect(model.predictions).toHaveLength(1);
    expect(model.predictions[0].id).toBe(prediction.id);
  });

  test('should throw error for non-existent model prediction', () => {
    const modelId = 'non-existent-model';
    const inputData = { userId: 'user1' };

    expect(() => {
      quantumTrackingService.makePrediction(modelId, inputData);
    }).toThrow('Quantum predictive model non-existent-model not found');
  });

  test('should clear old data', () => {
    // Add some recent events
    quantumTrackingService.trackQuantumEvent(userId, 'recent_event', { data: 'recent' });

    // Add an old event
    const oldEvent = quantumTrackingService.trackQuantumEvent(userId, 'old_event', { data: 'old' });
    oldEvent.timestamp = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000); // 100 days old

    expect(quantumTrackingService.quantumEvents).toHaveLength(2);

    // Clear events older than 90 days
    const removedCount = quantumTrackingService.clearOldData(90);

    expect(removedCount).toBe(1);
    expect(quantumTrackingService.quantumEvents).toHaveLength(1);
    expect(quantumTrackingService.quantumEvents[0].eventType).toBe('recent_event');
  });
});
