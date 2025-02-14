const SpotifyWebApi = require('spotify-web-api-node');
const User = require('../models/user');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

const REQUIRED_SCOPES = [
  'user-library-read',
  'playlist-modify-private',
  'playlist-modify-public',
  'user-top-read',
].join(' ');

// Standalone refresh token function
async function refreshUserToken(user) {
  try {
    if (!user.spotifyRefreshToken) {
      throw new Error('No refresh token available');
    }

    spotifyApi.setRefreshToken(user.spotifyRefreshToken);
    const data = await spotifyApi.refreshAccessToken();

    // Update user with new tokens
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        spotifyAccessToken: data.body.access_token,
        spotifyTokenExpiry: new Date(Date.now() + data.body.expires_in * 1000),
      },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    throw error;
  }
}

// Helper function to calculate average daily plays
async function calculateAverageDailyPlays(spotifyApi) {
  const recentTracks = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 50 });
  if (!recentTracks.body.items.length) return 0;

  const now = new Date();
  const oldestTrackDate = new Date(recentTracks.body.items[recentTracks.body.items.length - 1].played_at);
  const daysDifference = (now - oldestTrackDate) / (1000 * 60 * 60 * 24);
  
  return recentTracks.body.items.length / daysDifference;
}

const spotifyController = {
  async stats(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await User.findById(req.user._id);
      if (!user || !user.spotifyAccessToken) {
        return res.status(401).json({ error: 'Not connected to Spotify' });
      }

      // Check if token needs refresh
      if (new Date() > new Date(user.spotifyTokenExpiry)) {
        await refreshUserToken(user);
      }

      spotifyApi.setAccessToken(user.spotifyAccessToken);

      // Get user's top tracks and artists
      const [topTracks, topArtists] = await Promise.all([
        spotifyApi.getMyTopTracks({ limit: 50, time_range: 'short_term' }),
        spotifyApi.getMyTopArtists({ limit: 50, time_range: 'short_term' })
      ]);

      // Calculate total plays (estimate from top tracks)
      const totalPlays = topTracks.body.items.reduce((sum, track) => sum + track.popularity, 0);

      // Calculate hours listened (estimate: average song length * number of plays)
      const avgSongLength = 3.5; // minutes
      const hoursListened = (totalPlays * avgSongLength) / 60;

      // Get top genre from top artists
      const genreCounts = {};
      topArtists.body.items.forEach(artist => {
        artist.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      });
      const topGenre = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

      // Calculate average daily plays
      const avgDailyPlays = await calculateAverageDailyPlays(spotifyApi);

      res.json({
        totalPlays,
        hoursListened,
        topGenre,
        avgDailyPlays
      });
    } catch (error) {
      console.error('Error fetching Spotify stats:', error);
      res.status(500).json({ error: 'Failed to fetch Spotify stats' });
    }
  },

  async connect(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'You must be logged in to connect Spotify' });
      }

      const state = req.user._id.toString();
      const authorizeURL = spotifyApi.createAuthorizeURL(
        REQUIRED_SCOPES.split(' '),
        state,
        true
      );

      console.log('Generated Spotify authorize URL:', authorizeURL);
      res.json({ url: authorizeURL });
    } catch (error) {
      console.error('Spotify connect error:', error);
      res.status(500).json({ error: 'Failed to initialize Spotify connection' });
    }
  },

  async callback(req, res) {
    try {
      const { code, state } = req.body;
      console.log('Received callback with code and state:', { code, state });

      if (!code) {
        return res.status(400).json({ error: 'No authorization code received' });
      }

      if (!req.user || state !== req.user._id.toString()) {
        return res.status(401).json({ error: 'Invalid state parameter' });
      }

      const data = await spotifyApi.authorizationCodeGrant(code);
      console.log('Received Spotify tokens');

      spotifyApi.setAccessToken(data.body.access_token);
      const spotifyUser = await spotifyApi.getMe();

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          spotifyAccessToken: data.body.access_token,
          spotifyRefreshToken: data.body.refresh_token,
          spotifyTokenExpiry: new Date(Date.now() + data.body.expires_in * 1000),
          spotifyId: spotifyUser.body.id,
        },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error('Failed to update user with Spotify data');
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Spotify callback error:', error);
      res.status(error.statusCode || 500).json({
        error: 'Spotify callback failed',
        message: error.message,
      });
    }
  },

  async status(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if token is expired
      const isExpired = user.spotifyTokenExpiry && new Date() > new Date(user.spotifyTokenExpiry);

      // Refresh token if expired
      if (isExpired && user.spotifyRefreshToken) {
        try {
          const updatedUser = await refreshUserToken(user);
          return res.json({
            connected: true,
            userId: updatedUser.spotifyId,
          });
        } catch (error) {
          // If refresh fails, return disconnected status
          console.error('Token refresh failed:', error);
          return res.json({ connected: false });
        }
      }

      // Return connection status
      res.json({
        connected: Boolean(user.spotifyAccessToken && !isExpired),
        userId: user.spotifyId,
      });
    } catch (error) {
      console.error('Spotify status error:', error);
      res.status(500).json({ error: 'Failed to check Spotify status' });
    }
  },

  async disconnect(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          spotifyAccessToken: null,
          spotifyRefreshToken: null,
          spotifyTokenExpiry: null,
          spotifyId: null,
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'Successfully disconnected from Spotify',
        success: true,
      });
    } catch (error) {
      console.error('Spotify disconnect error:', error);
      res.status(500).json({ error: 'Failed to disconnect from Spotify' });
    }
  },
};

module.exports = spotifyController;
