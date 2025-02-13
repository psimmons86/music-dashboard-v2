const express = require('express');
const router = express.Router();
const appleMusicCtrl = require('../controllers/applemusic');
const ensureLoggedIn = require('../middleware/ensureLoggedIn');

// Public routes
router.get('/token', appleMusicCtrl.getMusicKitToken);

// Protected routes
router.use(ensureLoggedIn);

// Get Apple Music connection status
router.get('/status', appleMusicCtrl.getStatus);

// Save user's Apple Music token
router.post('/user-token', appleMusicCtrl.saveUserToken);

// Disconnect from Apple Music
router.post('/disconnect', appleMusicCtrl.disconnect);

// Get personalized recommendations
router.get('/recommendations', appleMusicCtrl.getRecommendations);

// Get user's music stats
router.get('/stats', appleMusicCtrl.getUserStats);

module.exports = router;
