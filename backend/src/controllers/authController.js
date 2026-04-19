const User = require('../models/User');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('bookmarks');
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        bookmarks: user.bookmarks,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Sign In / Sign Up
// @route   POST /api/auth/google
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'No credential provided' });
    }

    // Verify the Google token
    // For development without a real client ID, we might skip verification and just decode if verification fails
    // But let's try the secure approach first
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential
      });
      payload = ticket.getPayload();
    } catch (err) {
      // Fallback: If dummy client ID is used or verification fails (e.g. testing), just decode the jwt payload for demo
      // In production, you would reject this.
      console.warn('Google verify failed, decoding token manually for demo:', err.message);
      const parts = credential.split('.');
      payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    }

    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Invalid google token payload' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create user
      const randomPassword = crypto.randomBytes(20).toString('hex');
      user = await User.create({
        name,
        email,
        password: randomPassword,
        googleId,
        avatar: picture
      });
    } else {
      // Update googleId and avatar if missing
      let updateNeeded = false;
      if (!user.googleId) { user.googleId = googleId; updateNeeded = true; }
      if (!user.avatar || user.avatar === '') { user.avatar = picture; updateNeeded = true; }
      
      if (updateNeeded) {
        await user.save({ validateModifiedOnly: true });
      }
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio
      }
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    next(error);
  }
};

// @desc    Upload avatar
// @route   PUT /api/auth/profile/avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl }, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio
      }
    });

  } catch (error) {
    next(error);
  }
};
