const mongoose= require('mongoose'),
    Schema=mongoose.Schema;

// Onechat schema
const onechatSchema= new mongoose.Schema({
    uid: {
        type: String,
        required: true
    },
    suid: {
        type: String,
        required: true
    },
    messages: [{
    uidReciever: {
        type: String,
        required: true
    },
    uidSender: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    content: {
        type: String,
    }}]
});

const Onechat= mongoose.model('onechat', onechatSchema);

module.exports = Onechat;