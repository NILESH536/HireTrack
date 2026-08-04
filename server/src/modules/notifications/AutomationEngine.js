const EventBus = require('./EventBus');
const logger = require('../../utils/logger');

// Import Rules
const WorkflowStatusRule = require('./rules/WorkflowStatusRule');

class AutomationEngine {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Binds all rules to their respective events on the EventBus
   */
  initialize() {
    if (this.isInitialized) return;

    EventBus.on('workflow.candidate.moved', async (payload) => {
      try {
        await WorkflowStatusRule.execute(payload);
      } catch (error) {
        logger.error('AutomationEngine failed to execute WorkflowStatusRule', error);
      }
    });

    // Example bindings for future rules:
    // EventBus.on('workflow.candidate.rejected', WorkflowRejectionRule.execute);
    // EventBus.on('assessment.started', AssessmentTimerRule.execute);
    
    this.isInitialized = true;
    logger.info('AutomationEngine initialized and listening to EventBus.');
  }
}

module.exports = new AutomationEngine(); // Singleton
