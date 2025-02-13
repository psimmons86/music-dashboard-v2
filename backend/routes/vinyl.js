const express = require('express');
const vinylCtrl = require('../controllers/vinyl');
const ensureLoggedIn = require('../middleware/ensureLoggedIn');

const router = express.Router();

// All routes require authentication
router.use(ensureLoggedIn);

// Get all vinyl records for the logged-in user
router.get('/', vinylCtrl.getVinylRecords);

// Get vinyl collection stats
router.get('/stats', vinylCtrl.getVinylStats);

// Get recent additions
router.get('/recent', vinylCtrl.getRecentAdditions);

// Search Discogs database
router.get('/search', vinylCtrl.searchDiscogs);

// Add a new vinyl record
router.post('/', vinylCtrl.addVinylRecord);

// Update a vinyl record
router.put('/:id', vinylCtrl.updateVinylRecord);

// Delete a vinyl record
router.delete('/:id', vinylCtrl.deleteVinylRecord);

module.exports = router;
