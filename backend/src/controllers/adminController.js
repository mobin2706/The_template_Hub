const User = require('../models/User');
const Template = require('../models/Template');
const Review = require('../models/Review');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTemplates = await Template.countDocuments();
    const totalReviews = await Review.countDocuments();
    const totalDownloads = await Template.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);

    const categoryCounts = await Template.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentTemplates = await Template.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalTemplates,
        totalReviews,
        totalDownloads: totalDownloads[0]?.total || 0,
        categoryCounts,
        recentTemplates
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all templates (admin)
// @route   GET /api/admin/templates
exports.getAllTemplates = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Template.countDocuments(query);

    const templates = await Template.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      templates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update template status (admin)
// @route   PUT /api/admin/templates/:id
exports.updateTemplateStatus = async (req, res, next) => {
  try {
    const { status, featured } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured;

    const template = await Template.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('author', 'name');

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.status(200).json({ success: true, template });
  } catch (error) {
    next(error);
  }
};
