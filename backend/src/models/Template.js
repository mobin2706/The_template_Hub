const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Education', 'Business', 'Design', 'Technology', 'Healthcare', 'Legal', 'Marketing', 'Other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  fileUrl: {
    type: String,
    required: [true, 'Please upload a file']
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'rejected'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reviews
templateSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'template',
  justOne: false
});

// Index for search
templateSchema.index({ title: 'text', description: 'text', tags: 'text' });
templateSchema.index({ category: 1, averageRating: -1 });
templateSchema.index({ downloads: -1 });
templateSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Template', templateSchema);
