const Template = require('../models/Template');
const path = require('path');
const fs = require('fs');

// @desc    Get all templates with filters
// @route   GET /api/templates
exports.getTemplates = async (req, res, next) => {
  try {
    const { search, category, sort, page = 1, limit = 12, status = 'active' } = req.query;

    let query = { status };

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'popular') sortOption = { downloads: -1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Template.countDocuments(query);

    const templates = await Template.find(query)
      .populate('author', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: templates.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      templates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single template
// @route   GET /api/templates/:id
exports.getTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('author', 'name avatar bio')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name avatar' },
        options: { sort: { createdAt: -1 }, limit: 20 }
      });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.status(200).json({ success: true, template });
  } catch (error) {
    next(error);
  }
};

// @desc    Create template
// @route   POST /api/templates
exports.createTemplate = async (req, res, next) => {
  try {
    const { title, description, category, tags, content } = req.body;

    if (!req.file && !content) {
      return res.status(400).json({ success: false, message: 'Please upload a file or provide content' });
    }

      const categoryThumbnails = {
        'Business': 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=800',
        'Technology': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800',
        'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800',
        'Healthcare': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800',
        'Education': 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800',
        'Marketing': 'https://images.unsplash.com/photo-1542361345-89e58247f2d5?q=80&w=800'
      };

      let derivedThumbnail = req.body.thumbnailUrl || '';
      if (!derivedThumbnail && req.file && req.file.mimetype.startsWith('image/')) {
        derivedThumbnail = `/uploads/${req.file.filename}`;
      } else if (!derivedThumbnail) {
        derivedThumbnail = categoryThumbnails[category] || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800';
      }

      const template = await Template.create({
        title,
        description,
        category,
        tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [],
        fileUrl: req.file ? `/uploads/${req.file.filename}` : '',
        fileName: req.file ? req.file.originalname : 'Online Content',
        fileSize: req.file ? req.file.size : 0,
        fileType: req.file ? req.file.mimetype : 'text/html',
        thumbnailUrl: derivedThumbnail,
        content: content || '',
      author: req.user.id
    });

    await template.populate('author', 'name avatar');

    res.status(201).json({ success: true, template });
  } catch (error) {
    next(error);
  }
};

// @desc    Update template
// @route   PUT /api/templates/:id
exports.updateTemplate = async (req, res, next) => {
  try {
    let template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Check ownership (only enforced for changing metadata like title/description/category by non-admins)
    // Per user request: "anyone open the template/content able to see the template change it"
    const isOwner = template.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isChangingMetadata = req.body.title || req.body.description || req.body.category || req.body.status || req.body.featured;

    if (!isOwner && !isAdmin && isChangingMetadata) {
      return res.status(403).json({ success: false, message: 'Not authorized to change metadata' });
    }

    // Allow any authenticated user to update content
    const { title, description, category, tags, status, featured, content } = req.body;
    const updateData = {};
    if (content !== undefined) updateData.content = content;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (tags) updateData.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
    if (status && req.user.role === 'admin') updateData.status = status;
    if (featured !== undefined && req.user.role === 'admin') updateData.featured = featured;

    template = await Template.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('author', 'name avatar');

    res.status(200).json({ success: true, template });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete template
// @route   DELETE /api/templates/:id
exports.deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Check ownership
    if (template.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this template' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../../', template.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Template.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Template deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Download template file
// @route   GET /api/templates/:id/download
exports.downloadTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Increment download count
    template.downloads += 1;
    await template.save();

    // If fileUrl is http:// or https:// (like an Unsplash image), force a download instead of a redirect
    if (template.fileUrl && template.fileUrl.startsWith('http')) {
      try {
        const response = await fetch(template.fileUrl);
        if (!response.ok) throw new Error('External file fetch failed');
        
        res.setHeader('Content-Type', template.fileType || response.headers.get('content-type') || 'application/octet-stream');
        // Setting attachment forces the browser to download to the user's system rather than opening in a new tab
        res.setHeader('Content-Disposition', `attachment; filename="${template.fileName || 'template-download'}"`);
        
        const { Readable } = require('stream');
        return Readable.fromWeb(response.body).pipe(res);
      } catch (err) {
        console.error('External download error:', err);
        return res.status(500).json({ success: false, message: 'Failed to download external file' });
      }
    }

    const filePath = path.join(__dirname, '../../', template.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    res.download(filePath, template.fileName);
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending templates
// @route   GET /api/templates/trending
exports.getTrending = async (req, res, next) => {
  try {
    const { type = 'downloads', limit = 8 } = req.query;

    let sortOption = { downloads: -1 };
    if (type === 'rating') sortOption = { averageRating: -1, totalRatings: -1 };
    if (type === 'newest') sortOption = { createdAt: -1 };

    const templates = await Template.find({ status: 'active' })
      .populate('author', 'name avatar')
      .sort(sortOption)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, templates });
  } catch (error) {
    next(error);
  }
};

// @desc    Get templates by user
// @route   GET /api/templates/user/:userId
exports.getUserTemplates = async (req, res, next) => {
  try {
    const templates = await Template.find({
      author: req.params.userId,
      status: 'active'
    })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: templates.length, templates });
  } catch (error) {
    next(error);
  }
};
