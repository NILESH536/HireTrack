/**
 * DEPRECATED: This service is deprecated in favor of HiringIntelligenceEngine.
 * Proxying all calls to the new engine to maintain backward compatibility.
 */
const hiringIntelligenceService = require('../modules/hiring-intelligence');
const logger = require('../utils/logger');

class ClaudeServiceProxy {
  isConfigured() {
    return hiringIntelligenceService.isConfigured();
  }

  async getCareerAdvice(studentContext, userMessage, conversationHistory = []) {
    logger.warn('DEPRECATED: Using claudeService.getCareerAdvice. Please migrate to HiringIntelligenceEngine.');
    return hiringIntelligenceService.getCareerAdvice(studentContext, userMessage, conversationHistory);
  }

  async analyzeResumeFit(resumeText, jobDescription) {
    logger.warn('DEPRECATED: Using claudeService.analyzeResumeFit. Please migrate to HiringIntelligenceEngine.');
    return hiringIntelligenceService.matchJob(resumeText, jobDescription);
  }
}

module.exports = new ClaudeServiceProxy();
