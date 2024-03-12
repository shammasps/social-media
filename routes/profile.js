
var express = require('express');
var router = express.Router();
const User = require('../models/userModel');
const Club = require('../models/clubModel');

const Post = require('../models/postModel');
const data = require('../models/data');
const multer = require('multer');
const path = require('path');

// Route to render the profile page
router.get('/', async (req, res) => {
  try {
    console.log(req);
  const { profileUserId } = req.query;
  const sessionUser = req.session.user;
  const userId = profileUserId ? profileUserId : sessionUser._id.toString();

    const user = await User.findById(userId);
    user.password = ""; // dont sent passworkd to UI
    const username = sessionUser.username;
    // get all posts from database (mongodb)
    const posts = await Post.find({postedBy:userId}).sort({ postedDate: -1 });

    //set isImage and isVideo in that posts
    const postsWithMediaInfo = posts.map(post => {
      var isLiked= post.likes?.map(x=>x.likedBy.toString()).indexOf(userId.toString()) ?? -1;
      var likeCount=  post.likes?.length ?? 0;
      return {
        ...post.toObject(),
        isImage: post.imageUrl.endsWith('.jpg') || post.imageUrl.endsWith('.png') || post.imageUrl?.endsWith('.jpeg'),
        isVideo: post.imageUrl.endsWith('.mp4') || post.imageUrl.endsWith('.webm') || post.imageUrl?.endsWith('.3gp'),
        profilePicture:  user?.profilePicture,
        postedByName :user?.username,
        isLiked:isLiked > -1 ? true : false,
        likeCount: likeCount
      };
    });
    var following = user.followerList?.length ?? 0;
    var followers = await (await myfollowers(req,res,10000)).length;

    var isMyProfile = sessionUser._id.toString() == userId.toString()

    // var isFollowingMe = user.followerList?.length ?? 0;
    // var isFollower = await (await myfollowers(req,res,10000)).length;

    user.club = await Club.findOne({"members.memberId": user._id});
    console.log("user.club",user.club)
    // Assuming user.skills is an array of selected skill values
    user.userSkills  = user.skills?.map(x => x);
    user.userSkills  = data.sportsSkills.filter(x=> user.userSkills.indexOf(x.value)>-1).map(y=> y.text);
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
    
    // Assuming user.skills is an array of selected skill values
    user.userSkills  = user.skills?.map(x => x);
    user.userSkills  = data.sportsSkills.filter(x=> user.userSkills.indexOf(x.value)>-1).map(y=> y.text);

// Loop through each object in the sportsSkills array
data.sportsSkills.forEach(skill => {
    // Check if the skill text exists in the user's skills
    if (user.userSkills && user.userSkills.includes(skill.text)) {
        // If the skill is selected, set isSelected to true
        skill.isSelected = true;
    } else {
        // If the skill is not selected, set isSelected to false
        skill.isSelected = false;
    }
});
        //2. render UI- profileEdit page and pass profile details     
    res.render('profileEdit', { layout: 'layout', user:user,sportsSkills: data.sportsSkills });
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
      const { username, phone, birthday, aboutMe, skills } = req.body;
  
      // Update user details
      await User.findByIdAndUpdate(userId, {
        username,
        phone,
        birthday,
        aboutMe,
        skills
      });
  
      res.redirect('/profile'); // Redirect to the profile page after updating
    } catch (error) {
      console.error(error);
      res.redirect("/");
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
