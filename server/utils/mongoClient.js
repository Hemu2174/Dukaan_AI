const { MongoClient, ObjectId } = require('mongodb');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dukaan_ai';
const client = new MongoClient(mongoUri);

let db;

const connectDB = async () => {
  try {
    await client.connect();
    db = client.db('dukaan_ai');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
};

const collections = {
  users: () => getDB().collection('users'),
  helpers: () => getDB().collection('helpers'),
  transactions: () => getDB().collection('transactions'),
  alerts: () => getDB().collection('alerts'),
  products: () => getDB().collection('products'),
  distributors: () => getDB().collection('distributors'),
};

module.exports = { connectDB, getDB, collections, ObjectId, client };
