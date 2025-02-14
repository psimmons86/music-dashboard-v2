const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// JWT Creation Utility
const createJWT = (user) => {
  // Ensure SECRET is set
  if (!process.env.SECRET) {
    throw new Error('SECRET environment variable is not set');
  }

  // Create token with user information
  return jwt.sign(
    { 
      user: { 
        _id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      } 
    },
    process.env.SECRET,
    { expiresIn: '24h' }
  );
};

// Authentication Controller
const authController = {
  // User Signup
  async signup(req, res) {
    try {
      const { username, email, password, adminCode } = req.body;

      // Input validation
      if (!username || !password) {
        return res.status(400).json({ 
          message: 'Please provide username and password' 
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { username: new RegExp(`^${username}$`, 'i') },
          email ? { email: email.toLowerCase() } : undefined
        ].filter(Boolean)
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: existingUser.username.toLowerCase() === username.toLowerCase() 
            ? 'Username already exists'
            : 'Email already exists'
        });
      }

      // Determine user role
      const role = adminCode && adminCode === process.env.ADMIN_SECRET_CODE 
        ? 'admin' 
        : 'user';

      // Create new user
      const user = new User({
        username,
        email: email ? email.toLowerCase() : undefined,
        password,
        role
      });

      // Save user to database
      await user.save();

      // Generate JWT
      const token = createJWT(user);

      // Prepare user response (remove sensitive data)
      const userResponse = user.toObject();
      delete userResponse.password;

      // Send successful response
      res.status(201).json({
        user: userResponse,
        token
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ 
        message: 'Error signing up', 
        error: error.message 
      });
    }
  },

  // User Login
  async login(req, res) {
    try {
      const { email, username, password } = req.body;
      console.log('Login attempt for:', email || username); // Debug log

      // Input validation
      if ((!email && !username) || !password) {
        console.log('Missing credentials'); // Debug log
        return res.status(400).json({ 
          message: 'Please provide email/username and password' 
        });
      }

      // Find user by email or username (case-insensitive)
      const query = email 
        ? { email: email.toLowerCase() }
        : { username: new RegExp(`^${username}$`, 'i') };
      
      const user = await User.findOne(query);
      if (!user) {
        console.log('User not found:', email || username); // Debug log
        return res.status(401).json({ 
          message: 'Invalid credentials' 
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log('Invalid password for:', email || username); // Debug log
        return res.status(401).json({ 
          message: 'Invalid credentials' 
        });
      }

      // Generate JWT
      const token = createJWT(user);
      console.log('Generated token for:', email || username); // Debug log

      // Prepare user response (remove sensitive data)
      const userResponse = user.toObject();
      delete userResponse.password;

      // Send successful response
      console.log('Login successful for:', email || username); // Debug log
      res.json({
        user: userResponse,
        token
      });

    } catch (error) {
      console.error('Login error:', error);
      // Send a proper error response
      res.status(500).json({ 
        message: error.message || 'Error logging in',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  },

  // Get User Profile
  async getProfile(req, res) {
    try {
      // Find user by ID from token, excluding sensitive fields
      const user = await User.findById(req.user._id)
        .select('-password -__v');
      
      // Handle user not found
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found' 
        });
      }

      // Send user profile
      res.json(user);

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        message: 'Error getting profile', 
        error: error.message 
      });
    }
  },

  // Update User Role (Admin only)
  async updateRole(req, res) {
    try {
      // Check if the requesting user is an admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Unauthorized: Admin access required' 
        });
      }

      const { userId, role, secretKey } = req.body;

      // Validate admin secret key
      if (!secretKey || secretKey !== process.env.ADMIN_SECRET_CODE) {
        return res.status(403).json({ 
          message: 'Unauthorized: Invalid admin secret' 
        });
      }

      // Validate input
      if (!userId || !role) {
        return res.status(400).json({ 
          message: 'Please provide user ID and new role' 
        });
      }

      // Validate role
      const validRoles = ['user', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          message: 'Invalid role' 
        });
      }

      // Find and update user
      const user = await User.findByIdAndUpdate(
        userId, 
        { role }, 
        { 
          new: true, 
          select: '-password -__v' 
        }
      );

      // Handle user not found
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found' 
        });
      }

      // Send successful response
      res.json({
        message: 'User role updated successfully',
        user
      });

    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({ 
        message: 'Error updating user role', 
        error: error.message 
      });
    }
  },
};

module.exports = authController;
