const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();
require('./db');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Auth routes (no token required)
app.use('/api/auth', require('./routes/auth'));

// Middleware to check for and validate JWT token
app.use(require('./middleware/checkToken'));

// Apply ensureLoggedIn middleware for protected routes
app.use(require('./middleware/ensureLoggedIn'));

// Protected API Routes
app.use('/api/users', require('./routes/user'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/blogs', require('./routes/blog'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/news', require('./routes/news'));
app.use('/api/spotify', require('./routes/spotify'));
app.use('/api/applemusic', require('./routes/applemusic'));
app.use('/api/playlist', require('./routes/playlist'));
app.use('/api/weekly-playlist', require('./routes/weeklyPlaylist'));
app.use('/api/vinyl', require('./routes/vinyl'));

const port = process.env.PORT || 3001;

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Catch-all route for SPA client-side routing (must be after API routes and error handling)
app.get('/*', function(req, res, next) {
  // Skip if it's an API request
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server only after MongoDB connects
mongoose.connection.once('connected', () => {
  app.listen(port, function() {
    console.log(`Express app running on port ${port}`);
  });
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
