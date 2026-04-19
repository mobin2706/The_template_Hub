const Review = require('../models/Review');
const Template = require('../models/Template');

// @desc    Get reviews for a template
// @route   GET /api/reviews/:templateId
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ template: req.params.templateId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review
// @route   POST /api/reviews/:templateId
exports.addReview = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      template: req.params.templateId,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this template' });
    }

    // Don't allow self-review
    if (template.author.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot review your own template' });
    }

    const review = await Review.create({
      template: req.params.templateId,
      user: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment || ''
    });

    await review.populate('user', 'name avatar');

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Review.findOneAndDelete({ _id: req.params.id });

    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
