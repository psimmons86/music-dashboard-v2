const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  recentActivity: {
    type: Array,
    default: []
  },
  stats: {
    totalRecords: {
      type: Number,
      default: 0
    },
    totalPlays: {
      type: Number,
      default: 0
    },
    daysCollecting: {
      type: Number,
      default: 0
    }
  },
  lastLoginAttempt: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  }
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

module.exports = mongoose.model('User', userSchema, 'users');
