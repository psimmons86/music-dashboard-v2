const path = require('path');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const fs = require('fs');
const session = require('express-session');
const app = express();

// Load environment variables
require('dotenv').config();
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  SECRET: process.env.SECRET,
  PORT: process.env.PORT
});
require('./db');

// Create base public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Basic middleware
app.use(logger('dev'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.HEROKU_URL 
    : (process.env.FRONTEND_URL || 'http://localhost:5173'),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SECRET || 'music_dashboard_secret_key_2024',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Static file serving
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Create separate routers
const publicRouter = express.Router();
const protectedRouter = express.Router();

// Auth routes (no middleware, must be first)
app.use('/api/auth', require('./routes/auth'));

// Public routes
app.use('/api/applemusic/token', require('./controllers/applemusic').getMusicKitToken);
publicRouter.use('/news', require('./routes/news'));
publicRouter.use('/weekly-playlist', require('./routes/weeklyPlaylist'));
publicRouter.use('/articles', require('./routes/articles'));
publicRouter.use('/blog', require('./routes/blog'));
publicRouter.use('/spotify/connect', require('./routes/spotify'));
publicRouter.use('/spotify/callback', require('./routes/spotify'));
publicRouter.use('/applemusic', require('./routes/applemusic'));

// Protected routes
protectedRouter.use(require('./middleware/checkToken'));
protectedRouter.use(require('./middleware/ensureLoggedIn'));
protectedRouter.use('/user', require('./routes/user'));
protectedRouter.use('/posts', require('./routes/posts'));
protectedRouter.use('/spotify', require('./routes/spotify'));
protectedRouter.use('/playlist', require('./routes/playlist'));
protectedRouter.use('/vinyl', require('./routes/vinyl')); // Moved to protected routes

// Mount routers in specific order
app.use('/api', publicRouter);
app.use('/api', protectedRouter);

// Log all routes for debugging
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log('Route:', r.route.path);
  }
});

// SPA catch-all route
app.get('/*', function(req, res) {
  const frontendPath = path.join(__dirname, '../frontend/dist/index.html');
  if (fs.existsSync(frontendPath)) {
    res.sendFile(frontendPath);
  } else {
    res.status(404).send('Frontend build not found. Please run npm run build in the frontend directory.');
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Please log in again'
    });
  }

  res.status(err.status || 500).json({
    error: 'Something went wrong!',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Express app running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
