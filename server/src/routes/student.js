const router = require('express').Router();
const studentController = require('../controllers/studentController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// All routes require STUDENT role
router.use(authenticate, roleCheck('STUDENT'));

router.get('/dashboard', studentController.getDashboard);
router.get('/drives', studentController.getEligibleDrives);
router.post('/apply/:driveId', studentController.applyToDrive);
router.get('/applications', studentController.getApplications);
router.get('/interviews', studentController.getInterviews);
router.post('/resume', upload.single('resume'), studentController.uploadResume);
router.post('/analyze-ats', studentController.analyzeATS);
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);

// Epic 6: Career Intelligence & Predictions
router.get('/placement-prediction', studentController.getPlacementPrediction);
router.post('/placement-prediction/regenerate', studentController.regeneratePlacementPrediction);

module.exports = router;
