const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function getStatus(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        connected: Boolean(user.appleMusicToken && user.appleMusicUserToken),
        userId: user._id
      }
    });
  } catch (error) {
    console.error('Error getting Apple Music status:', error);
    res.status(500).json({ error: 'Failed to get Apple Music status' });
  }
}

async function getMusicKitToken(req, res) {
  try {
    // Read private key from environment variable or file
    const privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY;
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
      audience: 'https://apple-music.com',
      subject: keyId,
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

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.appleMusicToken = musicUserToken;
    await user.save();

    res.json({ success: true, message: 'Apple Music token saved successfully' });
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

async function getUserStats(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.appleMusicToken) {
      return res.status(401).json({ error: 'Apple Music not connected' });
    }

    // Here you would use the Apple Music API to get user stats
    // This is a placeholder that would need to be implemented with actual Apple Music API calls
    const stats = {
      topArtists: [],
      topAlbums: [],
      topGenres: []
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting Apple Music user stats:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
}

module.exports = {
  getStatus,
  getMusicKitToken,
  saveUserToken,
  disconnect,
  getRecommendations,
  getUserStats
};
