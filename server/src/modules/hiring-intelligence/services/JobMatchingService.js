const driveMatchRepository = require('../../../repositories/DriveMatchRepository');
const logger = require('../../../utils/logger');

class JobMatchingService {
  constructor(provider) {
    this.provider = provider;
  }

  /**
   * Calculates deterministic score based on hard requirements.
   * Weight: 40% of total match score.
   */
  _calculateDeterministicScore(student, drive) {
    let score = 0;
    
    // 1. CGPA Eligibility (20 points max)
    if (student.cgpa >= drive.minCgpa) {
      score += 20;
    } else {
      // Small penalty or partial points if very close
      const diff = drive.minCgpa - student.cgpa;
      if (diff <= 0.5) score += 10;
    }

    // 2. Branch Eligibility (20 points max)
    if (drive.eligibleBranches.length === 0 || drive.eligibleBranches.includes(student.branch)) {
      score += 20;
    }

    return score;
  }

  /**
   * Main matching orchestration function.
   */
  async matchJob(student, drive) {
    // 1. Check cache to save AI costs
    const cachedMatch = await driveMatchRepository.findMatch(student.id, drive.id);
    if (cachedMatch) {
      logger.info(`Returning cached match for Student:${student.id} / Drive:${drive.id}`);
      return cachedMatch;
    }

    logger.info(`Calculating new match for Student:${student.id} / Drive:${drive.id}`);

    // 2. Deterministic Calculation (Max 40 points)
    const deterministicScore = this._calculateDeterministicScore(student, drive);

    // 3. AI Semantic Matching
    // Fallback if resume is empty (AI won't do well, so provide a basic prompt)
    const { Resume } = require('../../../models');
    const primaryResume = await Resume.findOne({ where: { studentId: student.id, isPrimary: true } });
    
    const resumeText = primaryResume?.rawText || student.resumeText || `Skills: ${student.skills.join(', ')}. Branch: ${student.branch}. CGPA: ${student.cgpa}`;
    const jobDescription = `${drive.jobRole}\n\n${drive.jobDescription}`;

    let aiResult;
    try {
      aiResult = await this.provider.matchJob(resumeText, jobDescription);
    } catch (error) {
      logger.error('AI Matching failed:', error);
      throw new Error('AI Engine failed to process job match.');
    }

    // 4. Score Blending
    // AI matchScore is returned as 0-100. We weight it at 60%.
    let blendedScore = deterministicScore + (aiResult.matchScore * 0.6);

    // [EPIC 7] Assessment Integration
    const { AssessmentAttempt } = require('../../../models');
    if (drive.assessmentId) {
      const attempt = await AssessmentAttempt.findOne({
        where: { studentId: student.id, driveId: drive.id, status: 'EVALUATED' }
      });
      if (attempt) {
        logger.info(`Integrating assessment score ${attempt.totalScore} into job match.`);
        // If there is an assessment score, it should have a high weight.
        // Let's blend it: 50% Assessment, 30% AI Match, 20% Deterministic (from original 100)
        const adjustedDeterministic = deterministicScore * (20 / 40); // Max 20 points
        const adjustedAi = aiResult.matchScore * 0.3;               // Max 30 points
        const assessmentScoreWeighted = attempt.totalScore * 0.5;   // Max 50 points (assuming totalScore is out of 100)
        
        blendedScore = adjustedDeterministic + adjustedAi + assessmentScoreWeighted;
      }
    }

    // [EPIC 10] Compliance & Verification Trust Multiplier
    if (student.isVerified) {
      logger.info(`Applying Trust Multiplier for verified student ${student.id}`);
      blendedScore *= 1.05; // 5% boost for verified students
    }

    const finalMatchScore = Math.min(Math.max(Math.round(blendedScore), 0), 100); // clamp 0-100

    // 5. Build DriveMatch Result Object
    const matchData = {
      studentId: student.id,
      driveId: drive.id,
      matchScore: finalMatchScore,
      expectedShortlistingProbability: aiResult.expectedShortlistingProbability || (finalMatchScore / 100),
    };

    const AIExplanationModel = require('../../../models').AIExplanation;
    const ExplainableAIFramework = require('./ExplainableAIFramework');

    // Extract formatting explanation
    const formattedExplanation = ExplainableAIFramework.formatExplanation(aiResult);

    // 6. Persist to DB (Cache)
    try {
      const persistedMatch = await driveMatchRepository.create(matchData);
      
      // Also persist the explanation
      await AIExplanationModel.create({
        entityId: persistedMatch.id,
        entityType: 'DRIVE_MATCH',
        ...formattedExplanation,
      });

      // Attach explanation before returning so controllers have it
      persistedMatch.dataValues.explanation = formattedExplanation;
      return persistedMatch;
    } catch (error) {
      logger.error('Failed to cache DriveMatch or AIExplanation in DB:', error);
      // Return raw data even if caching fails
      return { ...matchData, explanation: formattedExplanation };
    }
  }
}

module.exports = JobMatchingService;
