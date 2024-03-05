
var express = require('express');
var router = express.Router();

const User = require('../models/userModel');
const multer = require('multer');
const path = require('path');
console.log("profilecheck");

// Route to render the profile page
router.get('/', async (req, res) => {
  console.log(req.session.user)
  const sessionUser = req.session.user;
    const userId = sessionUser._id;

    const user = await User.findOne({_id:userId});
    user.password = ""; // dont sent passworkd to UI
    res.render('profile', { layout: 'layout' , user:user });
});

// Route to render the profile edit page
router.get('/profileEdit', async (req, res) => {

  console.log(req.session.user)
    //0. take user details from session and set to a variable
    const sessionUser = req.session.user;
    const userId = sessionUser._id;


    //1. get profile from db by userid 
    const user = await User.findOne({_id:userId});
    user.password = ""; // dont sent passworkd to UI

    //2. render UI- profileEdit page and pass profile details     
    res.render('profileEdit', { layout: 'layout', user:user });
});

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/profile/'); // Destination folder
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
       cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    //   cb(null, 'profilePhoto.jpg'); // Set the filename
    },
  });

  const upload = multer({ storage: storage });

  router.post('/uploadPhoto', upload.single('profilePhoto'), async (req, res) => {

    // Update the user document with the new profile photo filename
    const sessionUser = req.session.user;
    const userId = sessionUser._id;
    const newPhotoFilename = 'uploads/profile/'+req.file.filename;
  
    try {
      await User.findByIdAndUpdate(userId, { profilePicture: newPhotoFilename });
      res.redirect("/profileEdit")
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating user profile photo.');
    }
  });

  router.post('/update', async (req, res) => {
    try {
      const sessionUser = req.session.user;
      const userId = sessionUser._id;
       // Assuming you have user authentication middleware
      const { username, phone, birthday, aboutMe } = req.body;
  
      // Update user details
      await User.findByIdAndUpdate(userId, {
        username,
        phone,
        birthday,
        aboutMe,
      });
  
      res.redirect('/profile'); // Redirect to the profile page after updating
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating user details.');
    }
  });

module.exports = router;
