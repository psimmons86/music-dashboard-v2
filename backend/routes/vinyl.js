const express = require('express');
const router = express.Router();
const vinylCtrl = require('../controllers/vinyl');
const ensureLoggedIn = require('../middleware/ensureLoggedIn');

// Base routes
router.get('/', vinylCtrl.index);
router.post('/', vinylCtrl.create);
router.get('/stats', vinylCtrl.stats);
router.get('/recent', vinylCtrl.recent);
router.get('/search', vinylCtrl.search);

// Filtered routes
router.get('/genre/:genre', vinylCtrl.byGenre);
router.get('/year/:year', vinylCtrl.byYear);
router.get('/condition/:condition', vinylCtrl.byCondition);

// Individual record routes
router.get('/:id', vinylCtrl.show);
router.put('/:id', vinylCtrl.update);
router.delete('/:id', vinylCtrl.delete);

module.exports = router;
