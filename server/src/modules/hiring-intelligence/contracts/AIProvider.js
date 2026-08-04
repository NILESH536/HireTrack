class AIProvider {
  constructor(config) {
    this.config = config;
    if (this.constructor === AIProvider) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  isConfigured() {
    throw new Error("Method 'isConfigured()' must be implemented.");
  }
}

module.exports = AIProvider;
