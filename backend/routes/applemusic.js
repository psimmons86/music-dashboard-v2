const express = require('express');
const router = express.Router();
const appleMusicCtrl = require('../controllers/applemusic');
const ensureLoggedIn = require('../middleware/ensureLoggedIn');

// Public routes (no middleware)
router.get('/token', appleMusicCtrl.getMusicKitToken);
router.post('/user-token', appleMusicCtrl.saveUserToken);
router.get('/status', appleMusicCtrl.getStatus);
router.post('/disconnect', appleMusicCtrl.disconnect);

// Protected routes (with middleware)
router.use(ensureLoggedIn);

// Get personalized recommendations
router.get('/recommendations', appleMusicCtrl.getRecommendations);

// Get user's music stats
router.get('/stats', appleMusicCtrl.getUserStats);

module.exports = router;
