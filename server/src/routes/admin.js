const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.use(authenticate, roleCheck('ADMIN'));

router.get('/dashboard', adminController.getDashboard);
router.get('/companies/pending', adminController.getPendingCompanies);
router.put('/companies/:id/approve', adminController.approveCompany);
router.put('/companies/:id/reject', adminController.rejectCompany);
router.get('/statistics', adminController.getStatistics);

module.exports = router;
