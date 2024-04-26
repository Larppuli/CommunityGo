const express = require('express');
const router = express.Router();
const axios = require('axios');
const Ride = require('../models/ride');

// Posting ride to the database
router.post('/', async (request, response) => {
  const rideData = request.body;
  try {
    const cleanRideData = {
      destination: rideData.destination,
      origin: rideData.origin,
    };

    // Make a POST request to Flask server to calculate ride time with parameters
    const apiResponse = await axios.post(process.env.FLASK_URI_TWO, cleanRideData);
    
    // Create a new Ride instance with ride time
    const ride = new Ride({
      destination: rideData.destination,
      arrivalTime: rideData.time,
      rideTime: apiResponse.data.ride_time,
      waypoints: [rideData.origin],
      routes: apiResponse.data.routes,
      dynamic: ""
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
router.get('/', async (request, response) => {
  try {
    const rides = await Ride.find();
    response.json(rides);
  } catch (error) {
    console.error('Error retrieving rides:', error);
    response.status(500).json({ error: 'Error occurred' });
  }
});

// Updating a ride in the database
router.put('/:id', async (request, response) => {
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
    ride.dynamic = updateData.dynamic;

    // Save the updated ride
    const updatedRide = await ride.save();
    response.json(updatedRide);
  } catch (error) {
    console.error('Error updating ride:', error);
    response.status(500).json({ error: 'Error occurred' });
  }
});

module.exports = router;