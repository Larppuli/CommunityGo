require('dotenv').config()
const mongoose = require('mongoose')
const url = process.env.MONGODB_URI

mongoose.connect(url)

const Ride = mongoose.model('Ride', {
    destination: String,
    pickup: String,
    latestArrivalTime: String
})
    
module.exports = Ride