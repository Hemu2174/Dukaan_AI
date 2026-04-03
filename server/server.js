require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base Route
app.get('/health', (req, res) => {
  res.json({ status: "OK" });
});

// API Routes
app.use('/api', routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
