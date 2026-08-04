const EventEmitter = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    // Increase limit if we have many modules listening
    this.setMaxListeners(20);
  }
}

// Export as a singleton so all modules share the same bus
module.exports = new EventBus();
