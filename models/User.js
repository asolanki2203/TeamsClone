const mongoose = require('mongoose');

//user schema declaration
const userSchema= new mongoose.Schema({
    uid: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: false
    },
    name: {
        type: String,
        required: true
    },
    dp: {
        type: String,
        required: true
    },
    contacts: {
        type: [{
            suid: {
                type: String,
                required: true
            },
            sname: {
                type: String,
                required: true
            },
            sdp: {
                type: String,
                required: true
            },
            read: {
                type: Boolean,
            }
        }],
        required: false,
        unique: false
    },
});

const User= mongoose.model('user', userSchema);

module.exports = User;