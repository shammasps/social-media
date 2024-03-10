const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Club = require('../models/clubModel');
const Message = require('../models/messageModel');
const { ObjectId } = require('mongodb');



router.get('/my', async (req, res) => {
    try {
        const sessionUser = req.session.user;
        const userId = sessionUser._id;

        // Find the club where the current user is a member
        const club = await Club.findOne({ 'members.memberId': userId }).populate('members.memberId', 'username');
        const clubs = await Club.find();

        console.log(club)
        // Pass the club details to the template
        res.render('myClub', { layout: 'layout', myClub: club , allClubs: clubs});
    } catch (error) {
        console.error('Error fetching club details:', error);
        res.status(500).send('Internal Server Error');
    }
});


// GET route to fetch a list of clubs
router.get('/list', async (req, res) => {
    try {
        const clubs = await Club.find();
        res.json(clubs);
    } catch (error) {
        console.error('Error fetching clubs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Save Club API
router.post('/save', async (req, res) => {
    try {
        const { clubName, location, email, phone, regNo } = req.body;
        const sessionUser = req.session.user;
        const userId = sessionUser._id;

        // Create a new Club instance
        const club = new Club({ clubName, location, email, phone, regNo });

        // Add the user as a member with admin privileges
        club.members = [{ memberId: userId, isAdmin: true }];

        // Save the club to the database
        const savedClub = await club.save();

        res.redirect("/club/my");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
        res.redirect("/club/my");
    }
});

  // Delete Club API
  router.delete('/delete/:clubId', async (req, res) => {
    try {
      const { clubId } = req.params;
      const deletedClub = await Club.findByIdAndDelete(clubId);
      if (!deletedClub) {
        res.redirect("/club/my");
          }
      res.json(deletedClub);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Get Club Details API
  router.get('/detail/:clubId', async (req, res) => {
    try {
      const { clubId } = req.params;
      const club = await Club.findById(clubId);
      if (!club) {
        return res.status(404).json({ error: 'Club not found' });
      }
      res.json(club);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  // POST route for adding a member to the Club
router.post('/addMember', async (req, res) => {
    try {
        const { clubId, memberId, isAdmin } = req.body;
        console.log(clubId, memberId, isAdmin);
        // Check if the member is already a member of any club
        const existingClubs = await Club.find({
            'members.memberId': memberId,
        });
        console.log(existingClubs);
        if (existingClubs.length > 0) {
            // Member already exists in a club, handle accordingly
            return res.status(400).json({ error: 'Member already belongs to a club' });
        }

        // Update the Club's members array
        const updatedClub = await Club.findByIdAndUpdate(
            clubId,
            { $push: { members: { memberId, isAdmin } } },
            { new: true }
        );

        res.redirect("/club/my");
        } catch (error) {
        console.error('Error adding member:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// API endpoint for member search
router.get('/searchMembers', async (req, res) => {
    try {
        const query = req.query.query;

        // Use a case-insensitive regular expression for a flexible search
        const regex = new RegExp(query, 'i');

        // Search for users based on the provided query in username or email
        const searchResults = await User.find({
            $or: [{ username: regex },{ firstname: regex },{ lastname: regex }, { email: regex }]
        }).select('username email _id'); // Adjust the fields you want to retrieve

        res.json(searchResults);
    } catch (error) {
        console.error('Error in member search API:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST route for removing a member from the Club
router.post('/removeMember', async (req, res) => {
    try {
        const { clubId, memberId } = req.body;

        // Update the Club's members array to remove the specified member
        const updatedClub = await Club.findByIdAndUpdate(
            clubId,
            { $pull: { members: { _id: memberId } } },
            { new: true }
        );

        res.json(updatedClub);
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;