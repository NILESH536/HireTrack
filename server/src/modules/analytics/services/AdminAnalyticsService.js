const { Application, Student, Company, Drive } = require('../../../models');
const { Sequelize } = require('sequelize');

class AdminAnalyticsService {

  async getDashboardAnalytics() {
    return {
      institutionalFunnel: await this.getInstitutionalFunnel(),
      branchWisePlacement: await this.getBranchWisePlacement(),
      topRecruiters: await this.getTopRecruiters(),
    };
  }

  async getInstitutionalFunnel() {
    const apps = await Application.findAll({
      attributes: [
        'finalResult',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['finalResult'],
      raw: true
    });
    return apps;
  }

  async getBranchWisePlacement() {
    const placements = await Application.findAll({
      where: { finalResult: 'SELECTED' },
      include: [{
        model: Student,
        as: 'student',
        attributes: ['branch']
      }],
      attributes: [
        [Sequelize.col('student.branch'), 'branch'],
        [Sequelize.fn('COUNT', Sequelize.col('Application.id')), 'placedCount']
      ],
      group: ['student.branch'],
      raw: true
    });
    return placements;
  }

  async getTopRecruiters() {
    const recruiters = await Application.findAll({
      where: { finalResult: 'SELECTED' },
      include: [{
        model: Drive,
        as: 'drive',
        attributes: [],
        include: [{
          model: Company,
          as: 'company',
          attributes: ['name']
        }]
      }],
      attributes: [
        [Sequelize.col('drive.company.name'), 'companyName'],
        [Sequelize.fn('COUNT', Sequelize.col('Application.id')), 'hires']
      ],
      group: ['drive.company.name'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('Application.id')), 'DESC']],
      limit: 10,
      raw: true
    });
    return recruiters;
  }
}

module.exports = AdminAnalyticsService;
