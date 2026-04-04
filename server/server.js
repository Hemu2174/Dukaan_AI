require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./utils/mongoClient');
const routes = require('./routes/index');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base Route
app.get('/health', (req, res) => {
  res.json({ status: "OK", database: "MongoDB" });
});

// API Routes
app.use('/api', routes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
