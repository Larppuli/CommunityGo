const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());

app.use(cors());

const startServer = async () => {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
};

startServer().catch((error) => console.error('Error starting the server:', error));

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Ride = require('./models/ride')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

// Kyytikerran lisäys
app.post('/rides', (request, response) => {
  const rideData = request.body;
  
  const ride = new Ride({
    destination: rideData.destination,
    pickup: rideData.pickup,
    time: rideData.time

  });
  
  ride.save()
    .then(savedRide => {
      response.status(201).json(savedRide);
    })
    .catch(error => {
      console.error('Error saving ride:', error);
      response.status(500).json({ error: 'Error occurred' });
    });
});

// Kyytien haku
app.get('/rides', (request, response) => {
  Ride.find()
    .then(rides => {
      console.log('Rides retrieved:', rides);
      response.json(rides);
    })
    .catch(error => {
      console.error('Error retrieving rides:', error);
      response.status(500).json({ error: 'Error occurred' });
    });
});

