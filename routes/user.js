var express = require('express');
var router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');


/* GET home page. */
router.get('/', function(req, res ) {
  res.render('login', {layout: 'layoutnonlogin'});
});

router.get('/signup', function(req, res,next) {
  res.render('signup',{layout: 'layoutnonlogin'});
});

router.post('/signup', async (req,res)=>{
  try {
    const newUser = new User(req.body);
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newUser.password, saltRounds);
    newUser.password=hashedPassword;
    // Check if the email already exists
  const existingUser = await User.findOne({ email: newUser.email});
  const existingUserWithUsername = await User.findOne({ username: newUser.username });

  if (existingUser) {
    // If the email exists, return an error response
    return res.status(400).json({ error: 'Email already exists' });
  }
  if (existingUserWithUsername) {
    // If the username exists, return an error response
    return res.status(400).json({ error: 'Username already exists' });
  }
    await newUser.save(); 
    console.log(newUser);
    
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ error: 'Error creating item' });
  }
    
});

router.post('/login', async (req, res) => {
  console.log(req.body);
  try {
    const  newUser= req.body;

    // Find the user by email
    const user = await User.findOne({ email:newUser.email });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ error: 'Invalid email' });
    }

    // Compare the entered password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(newUser.password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    user.password = ""; // dont sent passworkd to UI

    req.session.user = user;


    // You can generate a token or set a session here for authentication purposes
    // For simplicity, let's just send a success message
    res.redirect('/post');
    


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error during login' });
  }
});

// router.get('/usersList',(req,res)=>{
//   res.render('usersList',{layout: 'layout'});
// })


router.get('/messagePage',(req,res)=>{
  res.render('messagePage',{layout: 'layout'});
})

router.get('/usersList', async (req, res) => {

  try {
    
    const users = await User.find();
    res.render('usersList', { layout: 'layout',users });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving users');
  }
});

// POST route to handle user search
router.post('/searchUsers', async (req, res) => {
  console.log('Received search request:', req.body);
  const { searchTerm } = req.body;
  

  try {
    // Use a regular expression for case-insensitive search
    const users = await User.find({
      $or: [
        { firstname: { $regex: searchTerm, $options: 'i' } },
        { lastname: { $regex: searchTerm, $options: 'i' } },
        { username: { $regex: searchTerm, $options: 'i' } },
      ],
    });

    res.render('usersList', { users, searchTerm });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error searching for users');
  }
});


module.exports = router;
