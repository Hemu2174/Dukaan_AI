const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dukaan_ai';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB via Mongoose');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
