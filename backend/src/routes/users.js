const express = require('express');
const User = require('../models/User');
const Template = require('../models/Template');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-bookmarks');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const templateCount = await Template.countDocuments({ author: user._id, status: 'active' });
    const totalDownloads = await Template.aggregate([
      { $match: { author: user._id } },
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
        templateCount,
        totalDownloads: totalDownloads[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user bookmarks
// @route   GET /api/users/bookmarks/list
router.get('/bookmarks/list', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'bookmarks',
      populate: { path: 'author', select: 'name avatar' }
    });

    res.status(200).json({ success: true, bookmarks: user.bookmarks });
  } catch (error) {
    next(error);
  }
});

// @desc    Toggle bookmark
// @route   POST /api/users/bookmarks/:templateId
router.post('/bookmarks/:templateId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const templateId = req.params.templateId;

    const index = user.bookmarks.indexOf(templateId);
    let bookmarked;

    if (index > -1) {
      user.bookmarks.splice(index, 1);
      bookmarked = false;
    } else {
      user.bookmarks.push(templateId);
      bookmarked = true;
    }

    await user.save();

    res.status(200).json({ success: true, bookmarked, bookmarks: user.bookmarks });
  } catch (error) {
    next(error);
  }
});

// @desc    Get top creators
// @route   GET /api/users/leaderboard/top
router.get('/leaderboard/top', async (req, res, next) => {
  try {
    const creators = await Template.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$author',
          templateCount: { $sum: 1 },
          totalDownloads: { $sum: '$downloads' },
          avgRating: { $avg: '$averageRating' }
        }
      },
      { $sort: { totalDownloads: -1 } },
      { $limit: 10 }
    ]);

    const populatedCreators = await User.populate(creators, {
      path: '_id',
      select: 'name avatar bio'
    });

    const result = populatedCreators.map(c => ({
      user: c._id,
      templateCount: c.templateCount,
      totalDownloads: c.totalDownloads,
      avgRating: Math.round(c.avgRating * 10) / 10
    }));

    res.status(200).json({ success: true, creators: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
