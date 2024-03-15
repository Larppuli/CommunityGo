require('dotenv').config()
const mongoose = require('mongoose')
const url = process.env.MONGODB_URI

mongoose.connect(url)

const Ride = mongoose.model('Ride', {
    destination: JSON,
    pickup: JSON,
    time: String
    
})
    
module.exports = Ride