class EventBus {
  constructor() {
    this.subscribers = new Map();
    this.eventHistory = [];
  }

  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType).push(callback);
    return () => this.unsubscribe(eventType, callback);
  }

  unsubscribe(eventType, callback) {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  async publish(eventType, data) {
    const event = {
      id: `event_${Date.now()}`,
      type: eventType,
      data,
      timestamp: new Date(),
      processed: false
    };

    this.eventHistory.push(event);

    const callbacks = this.subscribers.get(eventType) || [];
    const results = await Promise.allSettled(
      callbacks.map(cb => cb(event))
    );

    event.processed = true;
    event.results = results;

    return event;
  }

  getEventHistory(limit = 100) {
    return this.eventHistory.slice(-limit);
  }

  getSubscribers(eventType) {
    return this.subscribers.get(eventType)?.length || 0;
  }

  getAllEventTypes() {
    return Array.from(this.subscribers.keys());
  }
}

module.exports = new EventBus();
