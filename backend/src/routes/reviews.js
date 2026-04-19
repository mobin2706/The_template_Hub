const express = require('express');
const { getReviews, addReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:templateId', getReviews);
router.post('/:templateId', protect, addReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
