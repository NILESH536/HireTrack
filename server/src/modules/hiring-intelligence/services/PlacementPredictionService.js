const { PlacementPrediction, AIExplanation, Student, Resume, DriveMatch, Application } = require('../../../models');
const ExplainableAIFramework = require('./ExplainableAIFramework');
const logger = require('../../../utils/logger');
const { Op } = require('sequelize');

class PlacementPredictionService {
  constructor(provider) {
    this.provider = provider;
  }

  /**
   * Generates or fetches a placement prediction for a student.
   * If forceRegenerate is false, it returns a cached prediction if it's less than 7 days old.
   */
  async generatePrediction(studentId, forceRegenerate = false) {
    // 1. Check for recent cached prediction
    if (!forceRegenerate) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentPrediction = await PlacementPrediction.findOne({
        where: {
          studentId,
          createdAt: { [Op.gte]: sevenDaysAgo },
        },
        order: [['createdAt', 'DESC']],
        include: [{ model: AIExplanation, as: 'explanation' }],
      });

      if (recentPrediction) {
        logger.info(`Returning cached Placement Prediction for Student:${studentId}`);
        return recentPrediction;
      }
    }

    logger.info(`Running new Placement Prediction for Student:${studentId}`);

    // 2. Aggregate Context Data
    const student = await Student.findByPk(studentId);
    if (!student) throw new Error('Student not found');

    const primaryResume = await Resume.findOne({ where: { studentId, isPrimary: true } });
    
    // Get all past drive matches to assess historical AI matching
    const driveMatches = await DriveMatch.findAll({ where: { studentId } });
    let avgMatchScore = 0;
    if (driveMatches.length > 0) {
      const sum = driveMatches.reduce((acc, curr) => acc + curr.matchScore, 0);
      avgMatchScore = Math.round(sum / driveMatches.length);
    }

    // Get number of applications
    const applicationsCount = await Application.count({ where: { studentId } });

    // [EPIC 7] Get Average Assessment Score
    const { AssessmentAttempt } = require('../../../models');
    const attempts = await AssessmentAttempt.findAll({ where: { studentId, status: 'EVALUATED' } });
    let avgAssessmentScore = 0;
    if (attempts.length > 0) {
      const sum = attempts.reduce((acc, curr) => acc + curr.totalScore, 0);
      avgAssessmentScore = Math.round(sum / attempts.length);
    }

    // Build rich student context object for the AI provider
    const studentContext = {
      cgpa: student.cgpa,
      branch: student.branch,
      skills: student.skills,
      careerGoal: student.careerGoal,
      resumeUploaded: !!primaryResume,
      resumeAtsScore: primaryResume?.atsScore || 0,
      resumeStructuredData: primaryResume?.structuredData || {},
      avgHistoricalMatchScore: avgMatchScore,
      totalApplications: applicationsCount,
      avgAssessmentScore
    };

    // 3. Hit AI Provider
    let aiResult;
    try {
      aiResult = await this.provider.predictPlacement(studentContext);
    } catch (error) {
      logger.error('Placement Prediction AI error:', error);
      throw new Error('Failed to generate career prediction.');
    }

    // 4. Persist Prediction Data
    const predictionData = {
      studentId,
      readinessScore: aiResult.readinessScore || 0,
      hiringProbability: aiResult.hiringProbability || 0,
      careerReadiness: aiResult.careerReadiness || 0,
      technicalReadiness: aiResult.technicalReadiness || 0,
      resumeReadiness: aiResult.resumeReadiness || 0,
      interviewReadiness: aiResult.interviewReadiness || 0,
      skillGaps: aiResult.skillGaps || [],
      recommendedPath: aiResult.recommendedPath || [],
      recommendedCertifications: aiResult.recommendedCertifications || [],
      recommendedProjects: aiResult.recommendedProjects || [],
      companyRecommendations: aiResult.companyRecommendations || [],
    };

    const persistedPrediction = await PlacementPrediction.create(predictionData);

    // 5. Persist XAI Explanation
    let formattedExplanation = {};
    if (aiResult.explanation) {
      formattedExplanation = ExplainableAIFramework.formatExplanation(aiResult);
    } else {
      // Fallback extraction
      formattedExplanation = ExplainableAIFramework.formatExplanation({
        explanation: {
          recommendations: aiResult.recommendedPath || [],
          reasoningSummary: aiResult.reasoningSummary || 'Prediction generated based on academic and resume data.',
          confidenceScore: 0.85,
          positiveFactors: ['Strong AI pattern match'],
          negativeFactors: aiResult.skillGaps || []
        }
      });
    }

    await AIExplanation.create({
      entityId: persistedPrediction.id,
      entityType: 'PLACEMENT_PREDICTION',
      ...formattedExplanation,
    });

    persistedPrediction.dataValues.explanation = formattedExplanation;
    return persistedPrediction;
  }
}

module.exports = PlacementPredictionService;
