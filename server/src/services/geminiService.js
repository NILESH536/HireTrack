/**
 * DEPRECATED: This service is deprecated in favor of HiringIntelligenceEngine.
 * Proxying all calls to the new engine to maintain backward compatibility.
 */
const hiringIntelligenceService = require('../modules/hiring-intelligence');
const logger = require('../utils/logger');

class GeminiServiceProxy {
  isConfigured() {
    return hiringIntelligenceService.isConfigured();
  }

  async getCareerAdvice(studentContext, userMessage, conversationHistory = []) {
    logger.warn('DEPRECATED: Using geminiService.getCareerAdvice. Please migrate to HiringIntelligenceEngine.');
    return hiringIntelligenceService.getCareerAdvice(studentContext, userMessage, conversationHistory);
  }

  async analyzeResumeATS(resumeText, studentContext, jobDescription) {
    logger.warn('DEPRECATED: Using geminiService.analyzeResumeATS. Please migrate to HiringIntelligenceEngine.');
    return hiringIntelligenceService.analyzeResumeATS(resumeText, studentContext, jobDescription);
  }

  async analyzeResumeFit(resumeText, jobDescription) {
    logger.warn('DEPRECATED: Using geminiService.analyzeResumeFit. Please migrate to HiringIntelligenceEngine.');
    return hiringIntelligenceService.matchJob(resumeText, jobDescription);
  }
}

module.exports = new GeminiServiceProxy();
