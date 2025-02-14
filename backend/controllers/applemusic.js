const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function getStatus(req, res) {
  try {
    // Check session first for non-logged-in users
    if (!req.user && req.session && req.session.appleMusicToken) {
      return res.json({
        success: true,
        data: {
          connected: true,
          isTemporary: true
        }
      });
    }

    // For logged-in users, check the database
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        success: true,
        data: {
          connected: Boolean(user.appleMusicToken),
          userId: user._id,
          isTemporary: false
        }
      });
    }

    // No connection found
    res.json({
      success: true,
      data: {
        connected: false
      }
    });
  } catch (error) {
    console.error('Error getting Apple Music status:', error);
    res.status(500).json({ error: 'Failed to get Apple Music status' });
  }
}

async function getMusicKitToken(req, res) {
  try {
    const privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY.replace(/\\n/g, '\n');
    const keyId = process.env.APPLE_MUSIC_KEY_ID;
    const teamId = process.env.APPLE_MUSIC_TEAM_ID;

    if (!privateKey || !keyId || !teamId) {
      throw new Error('Missing required Apple Music configuration');
    }

    // Create JWT token with claims required by Apple Music
    const token = jwt.sign({}, privateKey, {
      algorithm: 'ES256',
      expiresIn: '24h',
      issuer: teamId,
      header: {
        alg: 'ES256',
        kid: keyId
      }
    });

    res.json({ success: true, data: { token } });
  } catch (error) {
    console.error('Error generating MusicKit token:', error);
    res.status(500).json({ error: 'Failed to generate MusicKit token' });
  }
}

async function saveUserToken(req, res) {
  try {
    const { musicUserToken } = req.body;
    if (!musicUserToken) {
      return res.status(400).json({ error: 'Music user token is required' });
    }

    // Store token in session instead of database if not logged in
    if (!req.user) {
      if (!req.session) {
        req.session = {};
      }
      req.session.appleMusicToken = musicUserToken;
      return res.json({ 
        success: true, 
        message: 'Apple Music token saved to session',
        data: {
          isTemporary: true
        }
      });
    }

    // If logged in, save to user account
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.appleMusicToken = musicUserToken;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Apple Music token saved successfully',
      data: {
        userId: user._id,
        isTemporary: false
      }
    });
  } catch (error) {
    console.error('Error saving Apple Music token:', error);
    res.status(500).json({ error: 'Failed to save Apple Music token' });
  }
}

async function disconnect(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.appleMusicToken = null;
    user.appleMusicUserToken = null;
    await user.save();

    res.json({ success: true, message: 'Disconnected from Apple Music successfully' });
  } catch (error) {
    console.error('Error disconnecting from Apple Music:', error);
    res.status(500).json({ error: 'Failed to disconnect from Apple Music' });
  }
}

async function getRecommendations(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.appleMusicToken) {
      return res.status(401).json({ error: 'Apple Music not connected' });
    }

    // Here you would use the Apple Music API to get recommendations
    // This is a placeholder that would need to be implemented with actual Apple Music API calls
    const recommendations = {
      playlists: [],
      albums: [],
      tracks: []
    };

    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Error getting Apple Music recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
}

async function getStats(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.appleMusicToken) {
      return res.status(401).json({ error: 'Apple Music not connected' });
    }

    // Here you would use the Apple Music API to get user stats
    // This is a placeholder that would need to be implemented with actual Apple Music API calls
    const stats = {
      totalPlays: 1250,
      hoursListened: 75.5,
      topGenre: 'Alternative Rock',
      avgDailyPlays: 42.3
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting Apple Music stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
}

module.exports = {
  getStatus,
  getMusicKitToken,
  saveUserToken,
  disconnect,
  getRecommendations,
  getStats
};
