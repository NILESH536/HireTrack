const { asyncHandler } = require('../utils/helpers');
const { Company, Student } = require('../models');
const { NotFoundError } = require('../utils/errors');
const responseBuilder = require('../utils/responseBuilder');

const VerificationService = require('../modules/compliance/services/VerificationService');
const AuditService = require('../modules/compliance/services/AuditService');
const FraudDetectionService = require('../modules/compliance/services/FraudDetectionService');

exports.submitVerificationRequest = asyncHandler(async (req, res) => {
  const { entityType, entityId, comments } = req.body;
  
  const request = await VerificationService.submitRequest(entityType, entityId, comments);
  return responseBuilder.success(res, request, 'Verification request submitted successfully', 201);
});

exports.processVerificationRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, comments } = req.body;

  const request = await VerificationService.processRequest(id, status, comments, req.user.id);
  return responseBuilder.success(res, request, `Verification request ${status.toLowerCase()} successfully`);
});

exports.getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await VerificationService.getPendingRequests();
  return responseBuilder.success(res, requests, 'Pending requests fetched successfully');
});

exports.getAuditLogs = asyncHandler(async (req, res) => {
  const { limit = 100, offset = 0, actionType } = req.query;
  const filters = {};
  if (actionType) filters.actionType = actionType;

  const logs = await AuditService.getLogs(filters, parseInt(limit), parseInt(offset));
  return responseBuilder.success(res, logs, 'Audit logs fetched successfully');
});

// A route just for demonstrating FraudService validation
exports.validateCompanyRegistration = asyncHandler(async (req, res) => {
  const { companyName, email } = req.body;
  const validation = await FraudDetectionService.validateCompanyEmail(companyName, email, req.user.id);
  
  if (!validation.isValid) {
    return responseBuilder.error(res, 400, validation.warning, 'FRAUD_ALERT');
  }
  
  return responseBuilder.success(res, { isValid: true }, 'Company validation passed');
});
