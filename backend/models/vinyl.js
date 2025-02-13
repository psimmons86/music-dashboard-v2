const mongoose = require('mongoose');

const vinylSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  releaseYear: {
    type: Number
  },
  genre: {
    type: String
  },
  condition: {
    type: String,
    enum: ['Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good', 'Fair', 'Poor']
  },
  notes: String,
  coverImage: String,
  discogsId: String,
  dateAdded: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

vinylSchema.statics.getStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        genres: { $addToSet: '$genre' },
        avgYear: { $avg: '$releaseYear' },
        byCondition: {
          $push: {
            k: '$condition',
            v: 1
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalRecords: 1,
        uniqueGenres: { $size: '$genres' },
        avgYear: { $round: ['$avgYear', 0] },
        byCondition: { $arrayToObject: '$byCondition' }
      }
    }
  ]);

  return stats[0] || {
    totalRecords: 0,
    uniqueGenres: 0,
    avgYear: 0,
    byCondition: {}
  };
};

module.exports = mongoose.model('Vinyl', vinylSchema);
