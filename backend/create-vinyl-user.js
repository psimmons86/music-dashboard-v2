require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function createUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB music-dashboard');

    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      role: String
    }));

    // Create user with same credentials
    const hashedPassword = await bcrypt.hash('your-password', 10);
    const user = await User.create({
      username: 'psimmons86',
      email: 'hadroncollides@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Created user:', user);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createUser();
