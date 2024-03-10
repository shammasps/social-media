const mongoose = require('../config/db');
const data = require('../models/data');

const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  username: String,
  email: String,
  password: String,
  gender: String,
  profilePicture: String,
  phone: String,
  birthday: String,
  aboutMe: String,
  followerList: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      followedOn: { type: Date, default: Date.now },
    },
  ],
  skills: [{ type: String }],
});

// userSkills is a virtual field
userSchema.virtual('userSkills').get(function () {
  return data.sportsSkills
    .filter((x) => this.skills.indexOf(x.value) > -1)
    .map((y) => y.text);
});
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });



const User = mongoose.model('User', userSchema);
module.exports = User;
