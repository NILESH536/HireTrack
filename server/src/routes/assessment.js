const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

// Company Routes
router.post(
  '/', 
  roleCheck(ROLES.COMPANY, ROLES.ADMIN), 
  assessmentController.createAssessment
);

router.get(
  '/', 
  roleCheck(ROLES.COMPANY, ROLES.ADMIN), 
  assessmentController.getAssessments
);

router.post(
  '/:id/questions', 
  roleCheck(ROLES.COMPANY, ROLES.ADMIN), 
  assessmentController.addQuestions
);

router.put(
  '/:id/drive/:driveId', 
  roleCheck(ROLES.COMPANY, ROLES.ADMIN), 
  assessmentController.attachToDrive
);

// Student Routes
router.post(
  '/:id/start', 
  roleCheck(ROLES.STUDENT), 
  assessmentController.startAttempt
);

router.post(
  '/attempt/:attemptId/submit', 
  roleCheck(ROLES.STUDENT), 
  assessmentController.submitAnswer
);

router.post(
  '/attempt/:attemptId/finish', 
  roleCheck(ROLES.STUDENT), 
  assessmentController.finishAttempt
);

module.exports = router;
