const express = require('express');
const router = express.Router();
const coachingController = require('../controllers/coachingController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { ROLES } = require('../utils/constants');

router.use(authenticate);
router.use(roleCheck(ROLES.STUDENT)); // Only students access the coaching engine

// ──────────── Mock Interview Routes ────────────
router.post('/mock-interview/start', coachingController.startMockInterview);
router.post('/mock-interview/:attemptId/answer', coachingController.submitAnswer);
router.post('/mock-interview/:attemptId/complete', coachingController.completeInterview);

// ──────────── Learning Routes ────────────
router.get('/roadmap', coachingController.getLearningRoadmap);

module.exports = router;
