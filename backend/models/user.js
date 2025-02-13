const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  spotifyAccessToken: { 
    type: String,
    default: null
  },
  spotifyRefreshToken: { 
    type: String,
    default: null
  },
  spotifyTokenExpiry: { 
    type: Date,
    default: null
  },
  spotifyId: { 
    type: String,
    default: null
  },
  appleMusicToken: {
    type: String,
    default: null
  },
  appleMusicUserToken: {
    type: String,
    default: null
  },
  profilePicture: {
    type: String,
    default: '/default-profile.png'
  },
  favoriteGenres: [{
    type: String,
    enum: ['Rock', 'Hip Hop', 'Electronic', 'Pop', 'Jazz', 'Classical', 'R&B', 'Country', 'Metal', 'Folk', 'Blues']
  }],
  favoriteMoods: [{
    type: String,
    enum: ['Happy', 'Chill', 'Energetic', 'Sad', 'Focused']
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function(tryPassword) {
  try {
    if (!tryPassword || !this.password) return false;
    return await bcrypt.compare(tryPassword, this.password);
  } catch (err) {
    console.error('Password comparison error:', err);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);
