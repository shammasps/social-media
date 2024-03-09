
var express = require('express');
var router = express.Router();
const User = require('../models/userModel');
const Post = require('../models/postModel');
const multer = require('multer');
const path = require('path');

// Route to render the profile page
router.get('/', async (req, res) => {
  try {
    console.log(req);
  const { profileUserId } = req.query;
  const sessionUser = req.session.user;
  const userId = profileUserId ? profileUserId : sessionUser._id;

    const user = await User.findById({_id:userId});
    user.password = ""; // dont sent passworkd to UI
    const username = sessionUser.username;
    // get all posts from database (mongodb)
    const posts = await Post.find({postedBy:userId}).sort({ postedDate: -1 });

    //set isImage and isVideo in that posts
    const postsWithMediaInfo = posts.map(post => {
      return {
        ...post.toObject(),
        isImage: post.imageUrl.endsWith('.jpg') || post.imageUrl.endsWith('.png'),
        isVideo: post.imageUrl.endsWith('.mp4') || post.imageUrl.endsWith('.webm'),
        profilePicture:  user?.profilePicture,
        postedByName :user?.username
      };
    });
    var following = user.followerList?.length ?? 0;
    var followers = await (await myfollowers(req,res,10000)).length;

    var isMyProfile = sessionUser._id.toString() == userId.toString()

    // var isFollowingMe = user.followerList?.length ?? 0;
    // var isFollower = await (await myfollowers(req,res,10000)).length;

    res.render('profile', { layout: 'layout' , user:user,myPost:postsWithMediaInfo , following, followers, isMyProfile});
  }catch (e){
    console.log(e)
    res.redirect('/');
  }
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

    
    try {
      // Update the user document with the new profile photo filename
    const sessionUser = req.session.user;
    const userId = sessionUser._id;
    const newPhotoFilename = 'uploads/profile/'+req.file.filename;
  
      await User.findByIdAndUpdate(userId, { profilePicture: newPhotoFilename });
      res.redirect("/profile/profileEdit")
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
  const top10Followers = allFollowers.slice(0, total);

 const followersWithData= top10Followers.map(x=>{
    return {
      userId: x.user._id,
      followedOn: x.follower.followedOn,
      profilePicture: x.user.profilePicture,
      followerName: x.user.username,
      isAlreadyFollowing:me?.followerList.find(y=> y.userId.toString() == x.user._id.toString()) ? true : false
    };
  });    

  console.log(followersWithData);
  return followersWithData;
}



module.exports = router;
