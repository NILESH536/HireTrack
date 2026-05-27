const router = require('express').Router();
const companyController = require('../controllers/companyController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { driveRules, handleValidation } = require('../middleware/validate');

router.use(authenticate, roleCheck('COMPANY'));

router.get('/dashboard', companyController.getDashboard);
router.post('/drives', driveRules, handleValidation, companyController.createDrive);
router.get('/drives', companyController.getDrives);
router.get('/applicants/:driveId', companyController.getApplicants);
router.put('/shortlist/:applicationId', companyController.updateShortlist);
router.post('/bulk-shortlist', companyController.bulkShortlist);
router.post('/schedule', companyController.scheduleInterview);
router.put('/result/:applicationId', companyController.setResult);
router.put('/feedback/:slotId', companyController.addFeedback);
router.get('/export/:driveId', companyController.exportApplicants);

module.exports = router;
