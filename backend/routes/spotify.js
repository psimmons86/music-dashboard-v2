const express = require('express');
const router = express.Router();
const spotifyCtrl = require('../controllers/spotify');
const playlistCtrl = require('../controllers/playlist');
const checkToken = require('../middleware/checkToken');
const ensureLoggedIn = require('../middleware/ensureLoggedIn');

// Public routes (with token check only)
router.get('/connect', checkToken, spotifyCtrl.connect);
router.post('/callback', checkToken, spotifyCtrl.callback);
router.get('/status', checkToken, spotifyCtrl.status);
router.post('/disconnect', checkToken, spotifyCtrl.disconnect);

// Protected routes (with full auth)
router.use(checkToken);
router.use(ensureLoggedIn);

router.get('/stats', spotifyCtrl.stats);
router.post('/playlist', playlistCtrl.createPlaylist);

module.exports = router;
