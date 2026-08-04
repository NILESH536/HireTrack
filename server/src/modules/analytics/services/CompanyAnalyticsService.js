const { Drive, Application, AssessmentAttempt, DriveMatch } = require('../../../models');
const { Sequelize } = require('sequelize');

class CompanyAnalyticsService {
  
  async getDashboardAnalytics(companyId) {
    return {
      candidateFunnel: await this.getCandidateFunnel(companyId),
      assessmentStats: await this.getAssessmentStats(companyId),
      averageMatchScore: await this.getAverageMatchScore(companyId)
    };
  }

  async getCandidateFunnel(companyId) {
    // Join Application -> Drive where Drive.companyId = companyId
    const funnel = await Application.findAll({
      include: [{
        model: Drive,
        as: 'drive',
        where: { companyId },
        attributes: []
      }],
      attributes: [
        'finalResult',
        [Sequelize.fn('COUNT', Sequelize.col('Application.id')), 'count']
      ],
      group: ['finalResult'],
      raw: true
    });
    return funnel;
  }

  async getAssessmentStats(companyId) {
    // Join AssessmentAttempt -> Drive
    const stats = await AssessmentAttempt.findOne({
      include: [{
        model: Drive,
        as: 'drive',
        where: { companyId },
        attributes: []
      }],
      where: { status: 'EVALUATED' },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('total_score')), 'averageScore'],
        [Sequelize.fn('COUNT', Sequelize.col('AssessmentAttempt.id')), 'totalAttempts'],
        [Sequelize.fn('SUM', Sequelize.literal('CASE WHEN passed = true THEN 1 ELSE 0 END')), 'passedAttempts']
      ],
      raw: true
    });
    return stats;
  }

  async getAverageMatchScore(companyId) {
    const stats = await DriveMatch.findOne({
      include: [{
        model: Drive,
        as: 'drive',
        where: { companyId },
        attributes: []
      }],
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('match_score')), 'averageMatchScore']
      ],
      raw: true
    });
    return stats;
  }
}

module.exports = CompanyAnalyticsService;
