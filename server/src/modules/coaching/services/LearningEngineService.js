const { LearningRoadmap, Student, Resume, AssessmentAttempt, PlacementPrediction } = require('../../../models');
const HiringIntelligenceService = require('../../hiring-intelligence');

class LearningEngineService {
  async getOrGenerateRoadmap(studentId) {
    // Check if an active roadmap exists
    let roadmap = await LearningRoadmap.findOne({
      where: { studentId, status: 'ACTIVE' },
      order: [['createdAt', 'DESC']]
    });

    if (!roadmap) {
      roadmap = await this.generateNewRoadmap(studentId);
    }
    return roadmap;
  }

  async generateNewRoadmap(studentId) {
    const student = await Student.findByPk(studentId);
    if (!student) throw new Error('Student not found');

    // Archive previous roadmaps
    await LearningRoadmap.update(
      { status: 'ARCHIVED' },
      { where: { studentId, status: 'ACTIVE' } }
    );

    // Gather intelligence
    const primaryResume = await Resume.findOne({ where: { studentId, isPrimary: true } });
    const resumeText = primaryResume?.rawText || student.resumeText || '';

    // Get the most recent assessment score
    const latestAssessment = await AssessmentAttempt.findOne({
      where: { studentId, status: 'EVALUATED' },
      order: [['createdAt', 'DESC']]
    });
    const assessmentScore = latestAssessment ? latestAssessment.totalScore : 'N/A';

    // Get career intelligence
    const careerIntel = await PlacementPrediction.findOne({
      where: { studentId },
      order: [['createdAt', 'DESC']]
    });

    // Ask AI to generate a 3-week roadmap
    const roadmapData = await HiringIntelligenceService.provider.generateLearningRoadmap(
      resumeText,
      assessmentScore,
      careerIntel ? careerIntel.toJSON() : {}
    );

    const roadmap = await LearningRoadmap.create({
      studentId,
      roadmapData
    });

    return roadmap;
  }
}

module.exports = new LearningEngineService();
