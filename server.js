// server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = 4018;

// Import email processor
const { processEmails } = require('./emailProcessor');

// Import DB connection (your existing file)
require('./db');

// Import routes
const exportRoutes = require('./routes/routes');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', exportRoutes);

// Start server + run startup tasks
async function startServer() {
  try {
    // Ensure DB is connected before anything else
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected');
    }

    // Email is optional
    try {
      await processEmails();
    } catch (err) {
      console.warn('Email processing skipped:', err.message);
    }

    // Start Express server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });

  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

startServer();