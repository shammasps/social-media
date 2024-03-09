// db.js

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shammasps417:4UqtkhhI7VM79hOg@cluster0.sdqoay7.mongodb.net/social', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = mongoose;
