const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Message = require('../models/messageModel');
const { ObjectId } = require('mongodb');

router.get('/messagePage', async (req, res) => {
    try {
        const  {recipientId}  = req.query;
        const sessionUser = req.session.user;
        const userId = sessionUser._id;
        const users = await User.find();
        const recipient = recipientId ? await User.findById(new ObjectId(recipientId.toString())) : {};

        const myUser = userId ? await User.findById(new ObjectId(userId.toString())) : {};
        console.log(recipient)
        // Get messages between the current user and the recipient
        var messages = recipientId ? await Message.find({
            $or: [
                { from: userId, to: recipientId },
                { from: recipientId, to: userId }
            ]
        }).sort({ datetime: 1 }) : []; // Sort by datetime ascending
        messages = messages.map(message => {
            // Convert datetime to a Date object if it's not already
            const date = new Date(message.datetime);
        
            // Get individual components of the date
            const day = date.getDate().toString().padStart(2, '0'); // Zero padding for single-digit days
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based, so add 1
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0'); // Zero padding for single-digit hours
            const minutes = date.getMinutes().toString().padStart(2, '0'); // Zero padding for single-digit minutes
            const seconds = date.getSeconds().toString().padStart(2, '0'); // Zero padding for single-digit seconds
        
            // Construct the formatted datetime string
            const formattedDatetime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        
            // Update the datetime field of the message
            message.datetimeFormatted = formattedDatetime;
            message.isSentByCurrentUser = (message.from.toString() == userId.toString());
            message.profilePicture = message.isSentByCurrentUser ? myUser.profilePicture  : recipient.profilePicture ;
            return message;
        });
        
        // Filter out the current user from the user list
        const otherUsers = users.filter(user => user._id.toString() !== userId.toString());

        res.render('messagePage', { layout: 'layout', users: otherUsers, myUser: myUser, recipientId, messages, recipient });
    } catch (error) {
        console.error(error);
        res.redirect("/");
    }
});

router.post('/send-message', async (req, res) => {
    try {
        const { from, to, text } = req.body;
        const message = new Message({
            from,
            to,
            text,
            datetime: new Date()
        });
        await message.save();
        res.redirect("/chat/messagePage?recipientId="+to);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
