const mongoose = require('mongoose');
require('dotenv').config();

async function updateUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('./models/user');
    
    // Find your user by email
    const user = await User.findOne({ email: 'hadroncollides@gmail.com' });
    
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }

    // Update the user with the vinyl vault username
    user.username = 'psimmons86';
    await user.save();
    
    console.log('Updated user with vinyl vault username');
    console.log('Your records and data are preserved');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateUser();
