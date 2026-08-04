const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

// ──────────── Company Routes ────────────
router.post(
  '/template',
  roleCheck(ROLES.COMPANY, ROLES.ADMIN),
  workflowController.createTemplate
);

router.get(
  '/template',
  roleCheck(ROLES.COMPANY, ROLES.ADMIN),
  workflowController.getTemplates
);

router.post(
  '/application/:id/transition',
  roleCheck(ROLES.COMPANY, ROLES.ADMIN),
  workflowController.moveCandidate
);

router.post(
  '/application/:id/reject',
  roleCheck(ROLES.COMPANY, ROLES.ADMIN),
  workflowController.rejectCandidate
);

// ──────────── Shared Routes ────────────
router.get(
  '/application/:id/timeline',
  // Students can see their timeline, Companies/Admins can see timelines for their jobs.
  // (In a real app, you'd add middleware to verify the user owns the application or the company owns the drive).
  workflowController.getTimeline
);

module.exports = router;
