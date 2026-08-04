const { Resume, Student } = require('../../../models');
const resumeParser = require('../../../services/resumeParser');
const ExplainableAIFramework = require('./ExplainableAIFramework');
const logger = require('../../../utils/logger');

class ResumeIntelligenceService {
  constructor(provider) {
    this.provider = provider;
  }

  /**
   * Processes a newly uploaded resume file.
   * Parses text, requests AI intelligence, and stores in the DB.
   */
  async processAndStoreResume(studentId, fileUrl, filePath) {
    logger.info(`Extracting text for resume: ${filePath}`);
    const rawText = await resumeParser.extractText(filePath);
    
    if (!rawText) {
      throw new Error('Could not extract text from the resume file.');
    }

    // Determine new version number
    const existingCount = await Resume.count({ where: { studentId } });
    const version = existingCount + 1;

    // Optional: Reset isPrimary for older resumes
    if (existingCount > 0) {
      await Resume.update({ isPrimary: false }, { where: { studentId } });
    }

    // Attempt AI Analysis
    let aiSummary = '';
    let atsScore = 0;
    let structuredData = {};
    let explanation = {};

    try {
      // Mock student context for provider (since we don't have full student here)
      const studentContext = { careerGoal: 'Software Engineer', branch: 'CS' };
      const student = await Student.findByPk(studentId);
      if (student) {
        studentContext.careerGoal = student.careerGoal;
        studentContext.branch = student.branch;
      }
      
      const analysisResult = await this.provider.analyzeResumeATS(rawText, studentContext, null);
      
      atsScore = analysisResult.atsScore || 0;
      aiSummary = analysisResult.summary || '';
      
      structuredData = {
        formatScore: analysisResult.formatScore,
        contentScore: analysisResult.contentScore,
        keywordScore: analysisResult.keywordScore,
        matchingSkills: analysisResult.matchingSkills,
        futureSkills: analysisResult.futureSkills,
        formatIssues: analysisResult.formatIssues,
        sectionAnalysis: analysisResult.sectionAnalysis,
      };

      if (analysisResult.explanation) {
        explanation = ExplainableAIFramework.formatExplanation(analysisResult);
      }

    } catch (error) {
      logger.warn(`AI Analysis failed during resume upload for student ${studentId}: ${error.message}`);
    }

    // Store new Resume record
    const resume = await Resume.create({
      studentId,
      version,
      isPrimary: true,
      fileUrl,
      rawText,
      atsScore,
      structuredData,
      aiSummary,
    });

    // If explanation exists, create AIExplanation record
    if (Object.keys(explanation).length > 0) {
      const AIExplanationModel = require('../../../models').AIExplanation;
      await AIExplanationModel.create({
        entityId: resume.id,
        entityType: 'RESUME_ANALYSIS',
        ...explanation,
      });
      resume.dataValues.explanation = explanation;
    }

    return resume;
  }

  /**
   * Re-analyzes an existing resume against a specific Job Description.
   */
  async analyzeATSForJob(resumeId, jobDescription) {
    const resume = await Resume.findByPk(resumeId);
    if (!resume) throw new Error('Resume not found.');

    const studentContext = { careerGoal: 'Software Engineer', branch: 'CS' };

    const analysisResult = await this.provider.analyzeResumeATS(resume.rawText, studentContext, jobDescription);
    return analysisResult;
  }
}

module.exports = ResumeIntelligenceService;
