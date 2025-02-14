const mongoose = require('mongoose');
require('dotenv').config();

async function migrateUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('./models/user');
    
    // Find all users
    const users = await User.find({});
    
    for (const user of users) {
      // Extract username from email if no username exists
      if (!user.username) {
        // Use email prefix as username
        const username = user.email.split('@')[0];
        
        // Update user with username
        await User.findByIdAndUpdate(user._id, {
          username: username
        });
        
        console.log(`Updated user ${user.email} with username ${username}`);
      }
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateUsers();
