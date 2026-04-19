const express = require('express');
const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  downloadTemplate,
  getTrending,
  getUserTemplates
} = require('../controllers/templateController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/trending', getTrending);
router.get('/user/:userId', getUserTemplates);
router.get('/', getTemplates);
router.get('/:id', getTemplate);
router.get('/:id/download', downloadTemplate);

// Protected routes
router.post('/', protect, upload.single('file'), createTemplate);
router.put('/:id', protect, updateTemplate);
router.delete('/:id', protect, deleteTemplate);

module.exports = router;
