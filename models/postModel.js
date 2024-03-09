
const mongoose = require('../config/db');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: [{ type: String }],
  imageUrl: { type: String },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  postedDate: { type: Date },
  // Add other fields as needed
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
