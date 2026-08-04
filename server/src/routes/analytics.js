const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

// Student Analytics
router.get(
  '/student/dashboard',
  roleCheck(ROLES.STUDENT),
  analyticsController.getStudentDashboard
);

// Company Analytics
router.get(
  '/company/dashboard',
  roleCheck(ROLES.COMPANY),
  analyticsController.getCompanyDashboard
);

// Admin Analytics
router.get(
  '/admin/dashboard',
  roleCheck(ROLES.ADMIN, ROLES.PLACEMENT_OFFICER),
  analyticsController.getAdminDashboard
);

router.get(
  '/admin/predictive/high-risk',
  roleCheck(ROLES.ADMIN, ROLES.PLACEMENT_OFFICER),
  analyticsController.getInstitutionalRisk
);

module.exports = router;
