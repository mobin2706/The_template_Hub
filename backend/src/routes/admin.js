const express = require('express');
const { getStats, getAllTemplates, getAllUsers, updateTemplateStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/templates', getAllTemplates);
router.get('/users', getAllUsers);
router.put('/templates/:id', updateTemplateStatus);

module.exports = router;
