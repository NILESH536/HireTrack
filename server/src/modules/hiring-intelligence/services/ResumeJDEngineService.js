const { Resume, ResumeJDAnalysis, AIExplanation, Drive } = require('../../../models');
const ExplainableAIFramework = require('./ExplainableAIFramework');
const crypto = require('crypto');
const logger = require('../../../utils/logger');

class ResumeJDEngineService {
  constructor(provider) {
    this.provider = provider;
  }

  /**
   * Generates a hash for custom job descriptions to use in caching.
   */
  _hashString(str) {
    return crypto.createHash('sha256').update(str || '').digest('hex');
  }

  /**
   * Deep analyze a resume against a specific job description.
   * Caches the results to prevent repeated LLM calls.
   */
  async analyzeJD(studentId, resumeId, jobDescription, driveId = null) {
    // 1. Fetch Resume
    const resume = await Resume.findByPk(resumeId);
    if (!resume) {
      throw new Error('Resume not found.');
    }
    if (resume.studentId !== studentId) {
      throw new Error('Unauthorized: Resume does not belong to this student.');
    }

    // 2. Resolve the JD Text
    let jdText = jobDescription;
    let customJdHash = null;

    if (driveId && !jdText) {
      const drive = await Drive.findByPk(driveId);
      if (!drive) throw new Error('Drive not found.');
      jdText = drive.jobDescription;
    } else if (jdText) {
      customJdHash = this._hashString(jdText);
    }

    if (!jdText) {
      throw new Error('Job description is required for deep analysis.');
    }

    // 3. Check Cache
    let cachedAnalysis;
    if (driveId) {
      cachedAnalysis = await ResumeJDAnalysis.findOne({
        where: { resumeId, driveId },
        include: [{ model: AIExplanation, as: 'explanation' }],
      });
    } else if (customJdHash) {
      cachedAnalysis = await ResumeJDAnalysis.findOne({
        where: { resumeId, customJdHash },
        include: [{ model: AIExplanation, as: 'explanation' }],
      });
    }

    if (cachedAnalysis) {
      logger.info(`Returning cached Resume-JD Analysis for Resume:${resumeId}`);
      return cachedAnalysis;
    }

    logger.info(`Running deep Resume-JD Analysis for Resume:${resumeId}`);

    // 4. Hit the AI Provider
    let aiResult;
    try {
      aiResult = await this.provider.deepAnalyzeResumeJD(resume.rawText, jdText);
    } catch (error) {
      logger.error('Deep Resume-JD analysis failed:', error);
      throw new Error('AI Engine failed to deeply analyze resume fit.');
    }

    // 5. Persist the Analysis
    const analysisData = {
      studentId,
      resumeId,
      driveId: driveId || null,
      customJdHash,
      overallMatchScore: aiResult.overallMatchScore || 0,
      technicalSkillsScore: aiResult.technicalSkillsScore || 0,
      educationScore: aiResult.educationScore || 0,
      projectsScore: aiResult.projectsScore || 0,
      certificationsScore: aiResult.certificationsScore || 0,
      missingKeywords: aiResult.missingKeywords || [],
      missingSkills: aiResult.missingSkills || [],
      strongSections: aiResult.strongSections || [],
      weakSections: aiResult.weakSections || [],
    };

    const persistedAnalysis = await ResumeJDAnalysis.create(analysisData);

    // 6. Persist Explainable AI Recommendations
    let formattedExplanation = {};
    if (aiResult.explanation) {
      formattedExplanation = ExplainableAIFramework.formatExplanation(aiResult);
    } else {
      // Fallback extraction if provider returns flat json without explanation wrapper
      formattedExplanation = ExplainableAIFramework.formatExplanation({
        explanation: {
          recommendations: aiResult.recommendations || [],
          reasoningSummary: aiResult.reasoningSummary || 'Analysis complete.',
          confidenceScore: 0.9,
          positiveFactors: aiResult.strongSections || [],
          negativeFactors: aiResult.weakSections || []
        }
      });
    }

    await AIExplanation.create({
      entityId: persistedAnalysis.id,
      entityType: 'RESUME_JD_ANALYSIS',
      ...formattedExplanation,
    });

    persistedAnalysis.dataValues.explanation = formattedExplanation;
    return persistedAnalysis;
  }
}

module.exports = ResumeJDEngineService;
