const mongoose = require('mongoose');

const vinylSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear()
  },
  format: {
    type: String,
    default: 'LP',
    trim: true
  },
  plays: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  value: {
    type: Number
  },
  lastPlayed: {
    type: Date
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for efficient querying
vinylSchema.index({ user: 1, createdAt: -1 });
vinylSchema.index({ user: 1, year: 1 });

// Static method to get collection stats for a user
vinylSchema.statics.getStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        totalValue: { $sum: '$value' },
        avgYear: { $avg: '$year' }
      }
    },
    {
      $project: {
        _id: 0,
        totalRecords: 1,
        totalValue: { $round: ['$totalValue', 2] },
        avgYear: { $round: ['$avgYear', 0] }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalRecords: 0,
    totalValue: 0,
    avgYear: null
  };
};

// Static method to get recent additions for a user
vinylSchema.statics.getRecentAdditions = async function(userId, limit = 3) {
  return this.find({ user: new mongoose.Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .exec();
};

// Static method to search records by title or artist
vinylSchema.statics.search = async function(userId, query) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    user: new mongoose.Types.ObjectId(userId),
    $or: [
      { title: searchRegex },
      { artist: searchRegex }
    ]
  })
  .sort({ createdAt: -1 })
  .lean()
  .exec();
};

// Static method to get records by year
vinylSchema.statics.getByYear = async function(userId, year) {
  return this.find({
    user: new mongoose.Types.ObjectId(userId),
    year: parseInt(year)
  })
  .sort({ createdAt: -1 })
  .lean()
  .exec();
};

module.exports = mongoose.model('Vinyl', vinylSchema, 'vinyls');
