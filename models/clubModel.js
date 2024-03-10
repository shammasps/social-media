const mongoose = require('../config/db');

// Define the Club schema
const clubSchema = new mongoose.Schema({
    clubName: String,
    location: String,
    email: String,
    phone: String,
    regNo: String,
    isAdmin: Boolean,
    jersyPhoto:String,
    
    members: [
        {
            memberId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Assuming you have a User model
                required: true,
            },
            isAdmin: {
                type: Boolean,
                default: false,
            },
        },
    ]
  });
  
  const Club = mongoose.model('Club', clubSchema);
  module.exports = Club;