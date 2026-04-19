const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    default: ''
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews
reviewSchema.index({ template: 1, user: 1 }, { unique: true });

// Static method to recalculate average rating
reviewSchema.statics.calcAverageRating = async function(templateId) {
  const stats = await this.aggregate([
    { $match: { template: templateId } },
    {
      $group: {
        _id: '$template',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Template').findByIdAndUpdate(templateId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalRatings: stats[0].totalRatings
    });
  } else {
    await mongoose.model('Template').findByIdAndUpdate(templateId, {
      averageRating: 0,
      totalRatings: 0
    });
  }
};

// Recalculate after save
reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.template);
});

// Recalculate after remove
reviewSchema.post('findOneAndDelete', function(doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.template);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
