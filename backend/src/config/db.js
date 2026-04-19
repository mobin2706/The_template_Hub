const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    // Try connecting to the configured MongoDB URI first
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/templatehub';

    try {
      const conn = await mongoose.connect(uri, { 
        serverSelectionTimeoutMS: 5000,
        autoSelectFamily: false // Helps with some network/DNS resolution issues
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.log(`⚠️  Could not connect to MongoDB Atlas: ${err.message}`);
      console.log('💡 TIP: Check if your IP is whitelisted in MongoDB Atlas Network Access.');
      console.log('🔄 Starting in-memory server fallback...');
    }

    // Fallback: use mongodb-memory-server
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const memUri = mongoServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`✅ MongoDB In-Memory Server running at: ${memUri}`);
    console.log(`   ⚠️  Data will be lost when server restarts`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
