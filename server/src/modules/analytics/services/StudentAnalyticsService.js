const { PlacementPrediction, DriveMatch, AssessmentAttempt, Application } = require('../../../models');
const { Sequelize } = require('sequelize');

class StudentAnalyticsService {
  
  async getDashboardAnalytics(studentId) {
    const readinessTrend = await this.getReadinessTrend(studentId);
    const assessmentPerformance = await this.getAssessmentPerformance(studentId);
    const applicationSuccessRate = await this.getApplicationSuccessRate(studentId);
    const jobMatchTrend = await this.getJobMatchTrend(studentId);

    return {
      readinessTrend,
      assessmentPerformance,
      applicationSuccessRate,
      jobMatchTrend
    };
  }

  async getReadinessTrend(studentId) {
    const predictions = await PlacementPrediction.findAll({
      where: { studentId },
      order: [['createdAt', 'ASC']],
      attributes: ['createdAt', 'readinessScore', 'hiringProbability', 'resumeReadiness']
    });
    return predictions;
  }

  async getAssessmentPerformance(studentId) {
    const stats = await AssessmentAttempt.findOne({
      where: { studentId, status: 'EVALUATED' },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('total_score')), 'averageScore'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalAttempts'],
        [Sequelize.fn('SUM', Sequelize.literal('CASE WHEN passed = true THEN 1 ELSE 0 END')), 'passedAttempts']
      ],
      raw: true
    });
    return stats;
  }

  async getApplicationSuccessRate(studentId) {
    const apps = await Application.findAll({
      where: { studentId },
      attributes: [
        'finalResult',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['finalResult'],
      raw: true
    });
    return apps;
  }

  async getJobMatchTrend(studentId) {
    return await DriveMatch.findAll({
      where: { studentId },
      order: [['createdAt', 'ASC']],
      attributes: ['createdAt', 'matchScore', 'expectedShortlistingProbability']
    });
  }
}

module.exports = StudentAnalyticsService;
