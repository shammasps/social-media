const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming 'User' is the name of your user model
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming 'User' is the name of your user model
        required: true
    },
    datetime: {
        type: Date,
        default: Date.now,
        required: true
    },
    text:{
        type: String,
        default: "",
        required: true
    }

    // Add other fields as needed
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
