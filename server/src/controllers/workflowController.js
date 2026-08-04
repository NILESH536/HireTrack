const { asyncHandler } = require('../utils/helpers');
const { Company } = require('../models');
const { NotFoundError } = require('../utils/errors');
const responseBuilder = require('../utils/responseBuilder');
const WorkflowService = require('../modules/workflow/services/WorkflowService');

const workflowService = new WorkflowService();

exports.createTemplate = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ where: { userId: req.user.id } });
  if (!company) throw new NotFoundError('Company not found');

  const { name, stages } = req.body;
  const template = await workflowService.createTemplate(company.id, name, stages, false);
  
  return responseBuilder.success(res, template, 'Workflow template created successfully', 201);
});

exports.getTemplates = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ where: { userId: req.user.id } });
  if (!company) throw new NotFoundError('Company not found');

  const templates = await workflowService.getCompanyTemplates(company.id);
  return responseBuilder.success(res, templates, 'Templates fetched successfully');
});

exports.moveCandidate = asyncHandler(async (req, res) => {
  const { id } = req.params; // applicationId
  const { toStageId, comments } = req.body;

  const application = await workflowService.moveCandidate(id, toStageId, comments, req.user.id);
  return responseBuilder.success(res, application, 'Candidate moved successfully');
});

exports.rejectCandidate = asyncHandler(async (req, res) => {
  const { id } = req.params; // applicationId
  const { rejectionReason } = req.body;

  const application = await workflowService.rejectCandidate(id, rejectionReason, req.user.id);
  return responseBuilder.success(res, application, 'Candidate rejected successfully');
});

exports.getTimeline = asyncHandler(async (req, res) => {
  const { id } = req.params; // applicationId
  const timeline = await workflowService.getApplicationTimeline(id);
  
  return responseBuilder.success(res, timeline, 'Timeline fetched successfully');
});
