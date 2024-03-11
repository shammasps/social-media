const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Club = require('../models/clubModel');
const Message = require('../models/messageModel');
const { ObjectId } = require('mongodb');

const multer = require('multer');
const path = require('path');

message =""


router.get('/my', async (req, res) => {
    try {
        const sessionUser = req.session.user;
        const userId = sessionUser._id;
        const clubs = await Club.find();

        // Find the club where the current user is a member
        const club = await Club.findOne({ 'members.memberId': userId }).populate('members.memberId', 'username');
        if(club)
{        var has = club.members?.find(x=> x.isAdmin && x.memberId._id.toString() == userId.toString());
        
        club.isAdmin = has ? true : false;
}
        
        // Pass the club details to the template
        res.render('myClub', { layout: 'layout', myClub: club , allClubs: clubs, message:message});
    } catch (error) {
        console.error('Error fetching club details:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get("/addClubPage",(req,res)=>{
    res.render("addClub",{layout:"layout"})
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
        const sessionUser = req.session.user;
        const userId = sessionUser._id;

        //
        const { memberId } = req.body;
        console.log(req.body)
        const club = await Club.findOne({ 'members.memberId': new ObjectId(memberId.toString()) });
        
        console.log(club,"clubclubclubclub")
        if (club && club.members) 
        {
            var admins = club.members?.filter(x => x.isAdmin);
            var isMeAdmin = club.members?.find(x => x.memberId.toString() == memberId.toString() && x.isAdmin);
            if (admins.length == 1 && isMeAdmin) {
                message = "Should not remove, Only one admin"
                console.log(message)
                return res.redirect("/club/my");
            }

            if (club.members && club.members.length > 1) {
                console.log("removeClub", memberId)
                // Update the Club's members array to remove the specified member
                                
                try {
                    
                    const memberIndex = club.members.findIndex(cc => cc.memberId.toString() === memberId.toString());
                
                    if (memberIndex !== -1) {
                        // Remove the member from the members array
                        club.members.splice(memberIndex, 1);
                
                        // Save the updated club object to the database
                        const savedClub = await club.save();
                
                        console.log("Member removed. Updated Club:", savedClub);
                
                        // Optionally, fetch the updated document after the save
                        const fetchedClub = await Club.findById(club._id);
                        console.log("Fetched Club", fetchedClub);
                    } else {
                        console.log("Member not found in the club's members array.");
                    }
                } catch (error) {
                    console.error("Error updating club:", error);
                }
                
            }
        }
        res.redirect("/club/my");
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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

  router.post('/uploadJersy', upload.single('jersyPhoto'), async (req, res) => {

    
    try {
      // Update the user document with the new profile photo filename
    const sessionUser = req.session.user;
    const userId = sessionUser._id;
    const newPhotoFilename = 'uploads/profile/'+req.file.filename;
    const club = await Club.findOne({ 'members.memberId': userId });

      await Club.findByIdAndUpdate(club._id, { jersyPhoto: newPhotoFilename });
      res.redirect("/club/my")
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating user profile photo.');
    }
  });


  router.get('/adminMembers', async (req, res) => {
    try {
        const clubId = req.query.clubId;

        // Find the club by ID and populate the members with only admin members

        const club = await Club.findById(clubId).populate('members.memberId', 'username');

        if (!club) {
            return res.status(404).json({ error: 'Club not found' });
        }
        console.log(club.members)
        // Extract the admin members' usernames
        const adminMembers = club.members
            .filter(member => member && member.isAdmin &&  member.memberId && member.memberId.username)
            .map(member => member.memberId.username);

        res.json({ adminMembers });
    } catch (error) {
        console.error('Error fetching admin members:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;