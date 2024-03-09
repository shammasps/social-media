var express = require('express');
var router = express.Router();
const Post = require('../models/postModel');
const moment = require('moment');

console.log("post.js is loaded");
const path = require('path'); // Add this line to import the 'path' module

const multer = require('multer');
const { post } = require('./profile');
const User = require('../models/userModel');
/* GET users listing. */





router.get('/', async function(req, res, next) {
  try {

    const sessionUser = req.session.user;
    const userId = sessionUser._id;
    // get all posts from database (mongodb)
    const posts = await Post.find().sort({ postedDate: -1 });

    const allUsers = await User.find()

    //set isImage and isVideo in that posts
    const postsWithMediaInfo = posts.map(post => {
      var postedByDetails = allUsers.find(x=> x._id.toString() == post.postedBy.toString());
      return {
        ...post.toObject(),
        isImage: post.imageUrl.endsWith('.jpg') || post.imageUrl.endsWith('.png'),
        isVideo: post.imageUrl.endsWith('.mp4') || post.imageUrl.endsWith('.webm'),
        profilePicture:  postedByDetails?.profilePicture,
        postedByName :postedByDetails?.username
      };
    });
    // render home page - and pass posts into home page
    res.render('home', { layout: 'layout', posts: postsWithMediaInfo });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching posts' });
  }
});




router.get('/showcreatePost', function(req, res, next) {
  res.render('createPostPage',{layout: 'layout'});

});






console.log("post.js is loaded22");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
console.log("post.js is loaded22333");
const upload = multer({ storage: storage });
console.log("post.js is loaded2233344");


router.post('/savePost', upload.single('upload'), async (req, res) => {
  console.log("hit")

  try {
    const user = req.session.user;
    // Validate request data
    const { title, description, tags } = req.body;
    console.log(req.body)
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    console.log("A")

    // Create new post instance
    const newPost = new Post({
      title,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      postedBy: user._id,
      postedDate: new Date()
    });
    console.log("B")
    // Save post to MongoDB
    await newPost.save();
    console.log("C")
    res.redirect("/post")

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating post' });
  }
});



module.exports = router;
