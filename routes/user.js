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


router.get('/usersList', async (req, res) => {
  try {
    const sessionUser = req.session.user;
    const userId = sessionUser._id;

    const loggedInUser = await User.findById(userId);
    const MyExistingFollowers = loggedInUser.followerList;

    const users = await User.find({ _id: { $ne: userId } });
    console.log(MyExistingFollowers);
    var myfollower = await myfollowers(req,res, 1000);

    for (let i = 0; i < users.length; i++) {
      const follower = MyExistingFollowers.find(f => f.userId.toString() === users[i]._id.toString());

      console.log("Followersss ---- ------ ", follower);

      if (follower != null) {
        users[i].isFollower = true;
        users[i].followedOn = follower.followedOn; // Add followedOn to the user object
      }

      const isFollowingMe = myfollower.find(f => f.userId.toString() === users[i]._id.toString());
      users[i].isFollowingMe = isFollowingMe ? true : false;
      
    }
    console.log(users)
    res.render('usersList', { layout: 'layout', users });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving users');
  }
});

// POST route to handle user search
router.post('/searchUsers', async (req, res) => {
  console.log('Received search request:', req.body);
  const { searchTerm } = req.body;
  
  const sessionUser = req.session.user;
  const userId = sessionUser._id;

  
  try {
    // Use a regular expression for case-insensitive search
    const users = await User.find({
      $or: [
        { firstname: { $regex: searchTerm, $options: 'i' } },
        { lastname: { $regex: searchTerm, $options: 'i' } },
        { username: { $regex: searchTerm, $options: 'i' } },
      ],
      _id:{$ne:userId}
    });

    res.render('usersList', { users, searchTerm });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error searching for users');
  }
});



// Route for adding a follower
router.post('/addFollower', async (req, res) => {
  // Follower's id
  const { followerId } = req.body;  
  // Logged in user's id
  const sessionUser = req.session.user;
  const userId = sessionUser._id;

  try {
    // Find the user who will be followed
    const loggedInUser = await User.findById(userId);
    
    if (!loggedInUser) {
      return res.status(404).send('User not found');
    }
    // Check if the user is already a follower
    if (loggedInUser.followerList.some(follower => follower.userId.toString() === followerId.toString())) {
      return res.status(400).send('User is already a follower');
    }

    // Update the follower list for the user to follow
    loggedInUser.followerList.push({
      userId: followerId,
      followedOn: new Date()
    });

    // Save the updated user
    await loggedInUser.save();

    res.redirect('/usersList');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding follower');
  }
});


// Route for unfollowing a user
router.post('/removeFollower', async (req, res) => {
  // Follower's id to be removed
  const { followerId } = req.body;  
  // Logged in user's id
  const sessionUser = req.session.user;
  const userId = sessionUser._id;

  try {
    // Find the logged-in user
    const loggedInUser = await User.findById(userId);
    

    if (!loggedInUser) {
      return res.status(404).send('User not found');
    }

    // Find the index of the follower in the followerList array
    const followerIndex = loggedInUser.followerList.findIndex(follower => follower.userId.toString() === followerId.toString());

    // Check if the user is in the follower list
    if (followerIndex === -1) {
      return res.status(400).send('User is not a follower');
    }

    // Remove the user from the follower list
    loggedInUser.followerList.splice(followerIndex, 1);

    // Save the updated user
    await loggedInUser.save();

    res.redirect('/usersList');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error removing follower');
  }
});
router.get('/notification', async (req, res) => {
  try {
    followersWithData =await myfollowers(req, res, 10);
    res.render('notification', { layout: 'layout', top10Followers: followersWithData });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving followers for notification');
  }
});

async function myfollowers(req, res, total){
  const sessionUser = req.session.user;
  const userId = sessionUser._id;
  const me = await User.findById(userId);

  // Find users who are following the logged-in user
  const followersOfLoggedInUser = await User.find({ "followerList.userId": userId });

  // Sort followerList based on followedOn date in descending order for each user
  const followersWithSortedLists = followersOfLoggedInUser.map(user => ({
    ...user.toObject(),
    followerList: user.followerList.sort((a, b) => b.followedOn - a.followedOn)
  }));

  // Flatten the sorted follower lists and take the top 10
  const allFollowers = followersWithSortedLists.flatMap(user => 
    user.followerList.map(follower => ({ follower, user }))
  );
  //const sortedFollowers = allFollowers.sort((a, b) => b.follower.followedOn - a.follower.followedOn);

  let uniqueFollowers = removeDuplicates(allFollowers, '_id');

  const top10Followers = uniqueFollowers.slice(0, total);

 const followersWithData= top10Followers.map(x=>{
    return {
      userId: x.user._id,
      followedOn: x.follower.followedOn,
      profilePicture: x.user.profilePicture,
      followerName: x.user.username,
      isAlreadyFollowing:me?.followerList.find(y=> y.userId.toString() == x.user._id.toString()) ? true : false
    };
  });    
  top10Followers
  console.log(followersWithData);
  return followersWithData;
}


// Function to remove duplicates based on the _id field
function removeDuplicates(array, field) {
  let uniqueValues = [];
  return array.filter(item => {
      if (uniqueValues.indexOf(item[field]) === -1) {
          uniqueValues.push(item[field]);
          return true;
      }
      return false;
  });
}
module.exports = router;
