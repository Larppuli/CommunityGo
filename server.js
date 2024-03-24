const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

app.use(cors());
app.use(bodyParser.json());

app.use(cors());

const startServer = async () => {
  const port = 3001;
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

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

// Posting ride to the database
app.post('/rides', async (request, response) => {
  const rideData = request.body;
  
  try {

    const cleanRideData = {
      pickup: rideData.pickup.geometry.location,
      destination: rideData.destination.geometry.location,
      waypoints: rideData.waypoints
    }
    
    // Make a POST request to Flask server to calculate ride time with parameters
    const apiResponse = await axios.post(process.env.FLASK_URI, cleanRideData);
    
    // Create a new Ride instance with ride time
    const ride = new Ride({
      destination: rideData.destination,
      pickup: rideData.pickup,
      arrivalTime: rideData.time,
      rideTime: apiResponse.data.ride_time,
      waypoints: [],
      routes: apiResponse.data.routes
    });
    
    // Save the ride
    const savedRide = await ride.save();
    response.status(201).json(savedRide);
  } catch (error) {
    console.error('Error saving ride:', error);
    response.status(500).json({ error: 'Error occurred' });
  }
});

// Getting rides from the database
app.get('/rides', (request, response) => {
  Ride.find()
    .then(rides => {
      response.json(rides);
    })
    .catch(error => {
      console.error('Error retrieving rides:', error);
      response.status(500).json({ error: 'Error occurred' });
    });
});

// Updating a ride in the database
app.put('/rides/:id', async (request, response) => {
  const rideId = request.params.id;
  const updateData = request.body;
  
  try {
    // Find the ride by its ID
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return response.status(404).json({ error: 'Ride not found' });
    }
    
    // Update the ride attributes
    ride.rideTime = updateData.rideTime;
    ride.waypoints = updateData.waypoints;
    ride.routes = updateData.routes;

    // Save the updated ride
    const updatedRide = await ride.save();
    response.json(updatedRide);
  } catch (error) {
    console.error('Error updating ride:', error);
    response.status(500).json({ error: 'Error occurred' });
  }
});