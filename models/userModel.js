// itemModel.js

const mongoose = require('../config/db');

const User = mongoose.model('User', 
{ 
    firstname: String ,
    lastname: String ,
    username: String ,
    email: String ,
    password: String ,
    gender: String ,
    profilePicture: String,
    phone: String,
    birthday:String,
    aboutMe:String,
    followerList: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        followedOn: { type: Date, default: Date.now }
      }],
      skills: [{ type: String }] // Define the skills array field
    
});

  

module.exports = User;
