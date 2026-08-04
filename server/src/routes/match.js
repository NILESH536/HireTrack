const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { ROLES } = require('../utils/constants');

// Apply protection to all match routes
router.use(authenticate);

// Student checking their own match against a drive
router.get('/drive/:driveId', roleCheck(ROLES.STUDENT), matchController.getStudentDriveMatch);

// Admin or Company checking a specific student's match against a drive
router.get('/student/:studentId/drive/:driveId', roleCheck(ROLES.ADMIN, ROLES.COMPANY, ROLES.PLACEMENT_OFFICER), matchController.getAdminCompanyDriveMatch);

// Deep Resume-JD Analysis endpoint (Epic 5)
router.post('/analyze-jd', matchController.analyzeJD);

module.exports = router;
