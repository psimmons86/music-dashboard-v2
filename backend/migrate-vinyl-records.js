require('dotenv').config();
const mongoose = require('mongoose');

// Source database (vinyl-vault)
const sourceUri = 'mongodb+srv://admin:cY8zCS8Sp37HGVvx@student-cluster.xmbxi.mongodb.net/vinyl-vault';
// Destination database (music-dashboard)
const destUri = process.env.MONGODB_URI;

async function migrateRecords() {
  try {
    // Connect to both databases
    const sourceClient = await mongoose.connect(sourceUri);
    
    // Get your records from source database
    const sourceRecords = await sourceClient.connection.collection('records')
      .find({ owner: new mongoose.Types.ObjectId('6765fa62f42c906955deae7f') })
      .toArray();
    
    console.log(`Found ${sourceRecords.length} records in vinyl-vault database`);

    // Disconnect from source and connect to destination
    await mongoose.disconnect();
    const destClient = await mongoose.connect(destUri);

    // Get your user ID from the destination database
    const destUser = await destClient.connection.collection('users')
      .findOne({ _id: new mongoose.Types.ObjectId('6792bc2e5a9f876e84d56dbc') });

    if (!destUser) {
      throw new Error('User not found in music-dashboard database');
    }

    // Transform records to match new schema
    const transformedRecords = sourceRecords.map(record => ({
      title: record.title,
      artist: record.artist,
      year: record.year,
      format: record.format || 'LP',
      plays: record.plays || 0,
      notes: record.notes || '',
      imageUrl: record.imageUrl,
      value: record.value,
      lastPlayed: record.lastPlayed,
      user: destUser._id,
      createdAt: record.createdAt || new Date(),
      updatedAt: record.updatedAt || new Date()
    }));

    // Delete any existing records for this user
    const deleteResult = await destClient.connection.collection('vinyls')
      .deleteMany({ user: destUser._id });
    console.log(`Deleted ${deleteResult.deletedCount} existing records`);

    if (transformedRecords.length > 0) {
      // Insert records into destination database
      const insertResult = await destClient.connection.collection('vinyls')
        .insertMany(transformedRecords);
      console.log(`Migrated ${insertResult.insertedCount} records to music-dashboard database`);
    }

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    // Close all connections
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrateRecords();
