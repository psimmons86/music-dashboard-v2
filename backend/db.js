const mongoose = require('mongoose');

async function connectDB() {
  // Close any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  // Clear cached connections
  mongoose.models = {};
  mongoose.modelSchemas = {};

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB music-dashboard');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
}

connectDB();
