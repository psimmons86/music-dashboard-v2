const Vinyl = require('../models/vinyl');
const mongoose = require('mongoose');
const axios = require('axios');

// Get all vinyl records for a user
exports.getVinylRecords = async (req, res) => {
  try {
    const records = await Vinyl.find({ user: req.user._id })
      .sort({ dateAdded: -1 });
    res.json(records);
  } catch (err) {
    console.error('Error fetching vinyl records:', err);
    res.status(500).json({ error: 'Error fetching vinyl records' });
  }
};

// Get vinyl collection stats
exports.getVinylStats = async (req, res) => {
  try {
    const stats = await Vinyl.getStats(req.user._id);
    res.json(stats);
  } catch (err) {
    console.error('Error fetching vinyl stats:', err);
    res.status(500).json({ error: 'Error fetching vinyl stats' });
  }
};

// Get recent additions
exports.getRecentAdditions = async (req, res) => {
  try {
    const records = await Vinyl.find({ user: req.user._id })
      .sort({ dateAdded: -1 })
      .limit(5);
    res.json(records);
  } catch (err) {
    console.error('Error fetching recent additions:', err);
    res.status(500).json({ error: 'Error fetching recent additions' });
  }
};

// Search Discogs database
exports.searchDiscogs = async (req, res) => {
  try {
    const { query } = req.query;
    const response = await axios.get(`https://api.discogs.com/database/search`, {
      params: {
        q: query,
        type: 'release',
        per_page: 10
      },
      headers: {
        'Authorization': `Discogs key=${process.env.DISCOGS_KEY}, secret=${process.env.DISCOGS_SECRET}`,
        'User-Agent': 'MusicDashboard/1.0'
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error('Error searching Discogs:', err);
    res.status(500).json({ error: 'Error searching Discogs' });
  }
};

// Add vinyl record
exports.addVinylRecord = async (req, res) => {
  try {
    const record = new Vinyl({
      ...req.body,
      user: req.user._id
    });
    await record.save();
    res.status(201).json(record);
  } catch (err) {
    console.error('Error adding vinyl record:', err);
    res.status(500).json({ error: 'Error adding vinyl record' });
  }
};

// Update vinyl record
exports.updateVinylRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Vinyl.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (err) {
    console.error('Error updating vinyl record:', err);
    res.status(500).json({ error: 'Error updating vinyl record' });
  }
};

// Delete vinyl record
exports.deleteVinylRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Vinyl.findOneAndDelete({ _id: id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Error deleting vinyl record:', err);
    res.status(500).json({ error: 'Error deleting vinyl record' });
  }
};
