require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Load all models to register them with Mongoose
require('./models/User');
require('./models/Car');
require('./models/Rental');
require('./models/Location');

const app = express();

// Serve static files from the 'public' directory
app.use('/public', express.static('public'));

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('Hello from Express Server!');
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/rentals', require('./routes/rentals'));

const PORT = process.env.PORT || 5000;
const DB_URI = process.env.DB_URI;

mongoose.connect(DB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
