const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { exec } = require('child_process');
require('dotenv').config();

// Import route handlers
const rideRoutes = require('./api/rideRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
  process.exit(1); // Exit the process if unable to connect to MongoDB
});

// Mount routes
app.use('/rides', rideRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  
  // Run Python scripts for ridetime calculating
  exec('python services/multiPointRidetime.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running multiPointRidetime.py: ${error}`);
      return;
    }
    console.log(`Output from multiPointRidetime.py: ${stdout}`);
    console.error(`Errors from multiPointRidetime.py: ${stderr}`);
  });

  exec('python services/twoPointRidetime.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running twoPointRidetime.py: ${error}`);
      return;
    }
    console.log(`Output from twoPointRidetime.py: ${stdout}`);
    console.error(`Errors from twoPointRidetime.py: ${stderr}`);
  });
});
