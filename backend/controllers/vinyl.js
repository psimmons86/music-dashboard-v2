const Vinyl = require('../models/vinyl');
const mongoose = require('mongoose');

module.exports = {
  index,
  create,
  show,
  update,
  delete: deleteRecord,
  stats,
  recent,
  search,
  byGenre,
  byYear,
  byCondition
};

// Get paginated vinyl collection for a user
async function index(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Vinyl.find({ user: new mongoose.Types.ObjectId(req.user._id) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Vinyl.countDocuments({ user: new mongoose.Types.ObjectId(req.user._id) })
    ]);

    res.json({
      records,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total
    });
  } catch (err) {
    console.error('Error fetching vinyl collection:', err);
    res.status(500).json({ error: 'Failed to fetch vinyl collection', details: err.message });
  }
}

// Create a new vinyl record
async function create(req, res) {
  try {
    req.body.user = new mongoose.Types.ObjectId(req.user._id);
    const record = await Vinyl.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    console.error('Error creating vinyl record:', err);
    res.status(400).json({ error: 'Failed to create vinyl record', details: err.message });
  }
}

// Get a specific record
async function show(req, res) {
  try {
    const record = await Vinyl.findOne({
      _id: req.params.id,
      user: new mongoose.Types.ObjectId(req.user._id)
    }).lean();
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (err) {
    console.error('Error fetching record:', err);
    res.status(500).json({ error: 'Failed to fetch record', details: err.message });
  }
}

// Update a record
async function update(req, res) {
  try {
    const record = await Vinyl.findOneAndUpdate(
      { _id: req.params.id, user: new mongoose.Types.ObjectId(req.user._id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (err) {
    console.error('Error updating record:', err);
    res.status(400).json({ error: 'Failed to update record', details: err.message });
  }
}

// Delete a record
async function deleteRecord(req, res) {
  try {
    const record = await Vinyl.findOneAndDelete({
      _id: req.params.id,
      user: new mongoose.Types.ObjectId(req.user._id)
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Error deleting record:', err);
    res.status(500).json({ error: 'Failed to delete record', details: err.message });
  }
}

// Get collection stats
async function stats(req, res) {
  try {
    const stats = await Vinyl.getStats(req.user._id);
    res.json(stats);
  } catch (err) {
    console.error('Error fetching collection stats:', err);
    res.status(500).json({ error: 'Failed to fetch collection stats', details: err.message });
  }
}

// Get recent additions
async function recent(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const records = await Vinyl.getRecentAdditions(req.user._id, limit);
    res.json(records);
  } catch (err) {
    console.error('Error fetching recent additions:', err);
    res.status(500).json({ error: 'Failed to fetch recent additions', details: err.message });
  }
}

// Search records
async function search(req, res) {
  try {
    const records = await Vinyl.search(req.user._id, req.query.q);
    res.json(records);
  } catch (err) {
    console.error('Error searching records:', err);
    res.status(500).json({ error: 'Failed to search records', details: err.message });
  }
}

// Get records by genre
async function byGenre(req, res) {
  try {
    const records = await Vinyl.getByGenre(req.user._id, req.params.genre);
    res.json(records);
  } catch (err) {
    console.error('Error fetching records by genre:', err);
    res.status(500).json({ error: 'Failed to fetch records by genre', details: err.message });
  }
}

// Get records by year
async function byYear(req, res) {
  try {
    const records = await Vinyl.getByYear(req.user._id, req.params.year);
    res.json(records);
  } catch (err) {
    console.error('Error fetching records by year:', err);
    res.status(500).json({ error: 'Failed to fetch records by year', details: err.message });
  }
}

// Get records by condition
async function byCondition(req, res) {
  try {
    const records = await Vinyl.getByCondition(req.user._id, req.params.condition);
    res.json(records);
  } catch (err) {
    console.error('Error fetching records by condition:', err);
    res.status(500).json({ error: 'Failed to fetch records by condition', details: err.message });
  }
}
