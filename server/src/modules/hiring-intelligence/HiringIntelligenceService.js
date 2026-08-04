const ProviderFactory = require('./providers/ProviderFactory');
const config = require('./config');
const JobMatchingService = require('./services/JobMatchingService');
const ResumeIntelligenceService = require('./services/ResumeIntelligenceService');
const ResumeJDEngineService = require('./services/ResumeJDEngineService');
const PlacementPredictionService = require('./services/PlacementPredictionService');
const logger = require('../../utils/logger');

class HiringIntelligenceService {
  constructor() {
    this.provider = ProviderFactory.getProvider();
    this.jobMatchingService = new JobMatchingService(this.provider);
    this.resumeIntelligenceService = new ResumeIntelligenceService(this.provider);
    this.resumeJdEngineService = new ResumeJDEngineService(this.provider);
    this.placementPredictionService = new PlacementPredictionService(this.provider);
    logger.info(`HiringIntelligenceService initialized with provider: ${this.provider.constructor.name}`);
  }

  /**
   * Matches a resume against a job description.
   * Expects full Student and Drive model instances.
   */
  async matchJob(student, drive) {
    if (!config.features.enableJobMatching) {
      throw new Error('Job Matching feature is currently disabled.');
    }
    return this.jobMatchingService.matchJob(student, drive);
  }

  /**
   * Analyzes a resume for ATS compatibility and quality.
   */
  async analyzeResumeATS(resumeText, studentContext, jobDescription = null) {
    if (!config.features.enableResumeAnalysis) {
      throw new Error('Resume Analysis feature is currently disabled.');
    }
    return this.provider.analyzeResumeATS(resumeText, studentContext, jobDescription);
  }

  /**
   * Generates career advice and answers student queries.
   */
  async getCareerAdvice(studentContext, userMessage, conversationHistory = []) {
    if (!config.features.enableCareerRecommendation) {
      throw new Error('Career Recommendation feature is currently disabled.');
    }
    return this.provider.getCareerAdvice(studentContext, userMessage, conversationHistory);
  }

  /**
   * Predicts placement probability based on student context.
   */
  async predictPlacement(studentContext) {
    if (!config.features.enablePlacementPrediction) {
      throw new Error('Placement Prediction feature is currently disabled.');
    }
    return this.provider.predictPlacement(studentContext);
  }

  /**
   * Check if the current AI provider is configured with necessary API keys.
   */
  isConfigured() {
    return this.provider.isConfigured();
  }
}

module.exports = HiringIntelligenceService;
