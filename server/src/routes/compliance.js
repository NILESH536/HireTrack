const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

// ──────────── Verification Routes ────────────
// Students and Companies can submit requests
router.post(
  '/verify/request',
  roleCheck(ROLES.STUDENT, ROLES.COMPANY),
  complianceController.submitVerificationRequest
);

// Only Admins / POs can process requests
router.get(
  '/verify/pending',
  roleCheck(ROLES.ADMIN, ROLES.PLACEMENT_OFFICER),
  complianceController.getPendingRequests
);

router.post(
  '/verify/:id/action',
  roleCheck(ROLES.ADMIN, ROLES.PLACEMENT_OFFICER),
  complianceController.processVerificationRequest
);

// ──────────── Audit Routes ────────────
// Only Admins can view full audit logs
router.get(
  '/audit/logs',
  roleCheck(ROLES.ADMIN, ROLES.PLACEMENT_OFFICER),
  complianceController.getAuditLogs
);

// ──────────── Fraud Routes ────────────
router.post(
  '/fraud/validate-company',
  roleCheck(ROLES.ADMIN, ROLES.PLACEMENT_OFFICER),
  complianceController.validateCompanyRegistration
);

module.exports = router;
