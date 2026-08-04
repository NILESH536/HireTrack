const AIProvider = require('../contracts/AIProvider');
const logger = require('../../../utils/logger');

class OpenAIProvider extends AIProvider {
  constructor(providerConfig) {
    super(providerConfig);
  }

  isConfigured() {
    return !!this.config.apiKey;
  }

  // Implementation left stubbed for future epics
  async matchJob(resumeText, jobDescription) {
    throw new Error('OpenAI matchJob not yet implemented');
  }

  async analyzeResumeATS(resumeText, studentContext, jobDescription = null) {
    throw new Error('OpenAI analyzeResumeATS not yet implemented');
  }

  async getCareerAdvice(studentContext, userMessage, conversationHistory = []) {
    throw new Error('OpenAI getCareerAdvice not yet implemented');
  }

  async predictPlacement(studentContext) {
    throw new Error('OpenAI predictPlacement not yet implemented');
  }
}

module.exports = OpenAIProvider;
