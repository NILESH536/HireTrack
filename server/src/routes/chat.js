const router = require('express').Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { chatRules, handleValidation } = require('../middleware/validate');

router.use(authenticate, roleCheck('STUDENT'));

router.post('/send', chatRules, handleValidation, chatController.sendMessage);
router.get('/history', chatController.getHistory);
router.delete('/history', chatController.clearHistory);

module.exports = router;
