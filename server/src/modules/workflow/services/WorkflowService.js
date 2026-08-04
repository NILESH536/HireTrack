const { 
  WorkflowTemplate, 
  WorkflowStage, 
  ApplicationTransition, 
  Application,
  Drive,
  Company,
  Student
} = require('../../../models');
const logger = require('../../../utils/logger');
const { sequelize } = require('../../../config/database');
const EventBus = require('../../notifications/EventBus');

class WorkflowService {
  
  // ──────────── Template Management ────────────

  async createTemplate(companyId, name, stagesData, isDefault = false) {
    const transaction = await sequelize.transaction();
    try {
      const template = await WorkflowTemplate.create(
        { companyId, name, isDefault }, 
        { transaction }
      );

      const stages = stagesData.map((stage, index) => ({
        templateId: template.id,
        name: stage.name,
        stageType: stage.stageType || 'CUSTOM',
        orderIndex: index
      }));

      await WorkflowStage.bulkCreate(stages, { transaction });
      await transaction.commit();
      
      return await this.getTemplate(template.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getTemplate(templateId) {
    return await WorkflowTemplate.findByPk(templateId, {
      include: [{
        model: WorkflowStage,
        as: 'stages',
        order: [['orderIndex', 'ASC']]
      }]
    });
  }

  async getCompanyTemplates(companyId) {
    return await WorkflowTemplate.findAll({
      where: { companyId },
      include: [{
        model: WorkflowStage,
        as: 'stages',
        order: [['orderIndex', 'ASC']]
      }]
    });
  }

  // ──────────── Candidate Lifecycle ────────────

  async moveCandidate(applicationId, toStageId, comments, actorId) {
    const application = await Application.findByPk(applicationId, {
      include: [{ model: Drive, as: 'drive' }]
    });

    if (!application) throw new Error('Application not found');
    if (application.finalResult === 'REJECTED') throw new Error('Cannot move a rejected candidate');

    const toStage = await WorkflowStage.findByPk(toStageId);
    if (!toStage) throw new Error('Target stage not found');

    const transaction = await sequelize.transaction();
    try {
      // Create transition log
      await ApplicationTransition.create({
        applicationId,
        fromStageId: application.currentStageId,
        toStageId,
        status: 'MOVED',
        comments,
        actionBy: actorId
      }, { transaction });

      // Update application
      application.currentStageId = toStageId;
      // If moving to an offer stage, we might implicitly mark them SELECTED
      if (toStage.stageType === 'OFFER') {
        application.finalResult = 'SELECTED';
      }
      await application.save({ transaction });

      await transaction.commit();
      
      // [EPIC 11] Trigger Event for Automation Engine
      const companyName = application.drive?.company?.name || 'the company';
      EventBus.emit('workflow.candidate.moved', {
        studentId: application.studentId,
        applicationId: application.id,
        stageName: toStage.name,
        stageType: toStage.stageType,
        companyName: companyName
      });
      
      logger.info(`Candidate ${application.studentId} moved to stage ${toStage.name}`);
      
      return application;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async rejectCandidate(applicationId, rejectionReason, actorId) {
    const application = await Application.findByPk(applicationId);
    if (!application) throw new Error('Application not found');

    const transaction = await sequelize.transaction();
    try {
      // Create transition log
      await ApplicationTransition.create({
        applicationId,
        fromStageId: application.currentStageId,
        toStageId: application.currentStageId, // Stays in same stage, just status changes
        status: 'REJECTED',
        comments: 'Application rejected',
        rejectionReason,
        actionBy: actorId
      }, { transaction });

      // Update application
      application.finalResult = 'REJECTED';
      application.rejectionReason = rejectionReason;
      await application.save({ transaction });

      await transaction.commit();
      logger.info(`Candidate ${application.studentId} rejected.`);
      
      return application;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getApplicationTimeline(applicationId) {
    return await ApplicationTransition.findAll({
      where: { applicationId },
      include: [
        { model: WorkflowStage, as: 'fromStage', attributes: ['name', 'stageType'] },
        { model: WorkflowStage, as: 'toStage', attributes: ['name', 'stageType'] }
      ],
      order: [['createdAt', 'ASC']]
    });
  }
}

module.exports = WorkflowService;
