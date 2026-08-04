const ProviderFactory = require('../../hiring-intelligence/providers/ProviderFactory');
const { PlacementPrediction, Student } = require('../../../models');
const logger = require('../../../utils/logger');
const { Op } = require('sequelize');

class PredictiveAnalyticsService {
  constructor() {
    this.provider = ProviderFactory.getProvider();
  }

  async identifyHighRiskStudents() {
    // 1. Fetch students with low hiring probability
    const recentPredictions = await PlacementPrediction.findAll({
      where: { hiringProbability: { [Op.lt]: 0.4 } },
      include: [{ model: Student, as: 'student' }],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    if (!recentPredictions || recentPredictions.length === 0) {
      return { status: 'healthy', interventionPlan: 'No high-risk students detected.' };
    }

    const aggregatedGaps = {};
    recentPredictions.forEach(pred => {
      (pred.skillGaps || []).forEach(gap => {
        if (!aggregatedGaps[gap.skill]) aggregatedGaps[gap.skill] = 0;
        aggregatedGaps[gap.skill]++;
      });
    });

    const context = {
      highRiskCount: recentPredictions.length,
      commonSkillGaps: aggregatedGaps
    };

    try {
      const plan = await this.provider.predictInstitutionalRisk(context);
      return {
        affectedStudents: recentPredictions.map(p => ({
          studentId: p.studentId,
          name: p.student.name,
          probability: p.hiringProbability
        })),
        aiAnalysis: plan
      };
    } catch (error) {
      logger.error('Failed to run predictive AI:', error);
      throw new Error('Predictive AI failed.');
    }
  }
}

module.exports = PredictiveAnalyticsService;
