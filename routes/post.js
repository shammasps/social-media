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
const { ObjectId } = require('mongodb');





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
      var isLiked= post.likes?.map(x=>x.likedBy.toString()).indexOf(userId.toString()) ?? -1;
        var likeCount=  post.likes?.length ?? 0;
      return {
        ...post.toObject(),
        isImage: post.imageUrl?.endsWith('.jpg') || post.imageUrl?.endsWith('.png') || post.imageUrl?.endsWith('.jpeg'),
        isVideo: post.imageUrl?.endsWith('.mp4') || post.imageUrl?.endsWith('.webm') || post.imageUrl?.endsWith('.3gp'),
        profilePicture:  postedByDetails?.profilePicture,
        postedByName :postedByDetails?.username,
        isLiked:isLiked > -1 ? true : false,
        likeCount: likeCount
      };
    });
    console.log(postsWithMediaInfo)
    // render home page - and pass posts into home page
    res.render('home', { layout: 'layout', posts: postsWithMediaInfo , userData:sessionUser });
    
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

router.get('/delete/:postId', async (req, res) => {
 
  try {
    const postId = req.params.postId.toString();
    console.log('Received request to delete post with ID:', postId);
    const objId = new ObjectId(postId);
  
    // Find the post and delete it
    const deletedPost = await Post.findByIdAndDelete(objId);

    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

     res.redirect('/profile'); // Redirect to the home page or another appropriate page
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.post('/like', async (req, res) => {
  console.log("11111111")

  const { postId } = req.body;
  console.log(postId,"postId")

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.session.user._id;

    // Check if the user has already liked the post
    const alreadyLikedIndex = post.likes.findIndex(like => like.likedBy.toString() === userId.toString());
    console.log(alreadyLikedIndex,"alreadyLikedIndex")
    if (alreadyLikedIndex !== -1) {
      // User has already liked the post, remove the like
      post.likes.splice(alreadyLikedIndex, 1);
    } else {
      // User hasn't liked the post, add the like
      post.likes.push({ likedBy: userId });
    }
    console.log(post.likes,"post.likes")

    await post.save(); // Save the updated post
    return res.redirect("/post");
  } catch (error) {
    console.error(error);
    return res.redirect("/");
  }
});

module.exports = router;
