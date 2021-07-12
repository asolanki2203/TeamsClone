const User = require('../models/User');
const { v4: uuidv4 }= require('uuid');

module.exports.createRoom= (req,res)=>{
    const link= `${uuidv4()}`
    res.status(200).json({link});
}

module.exports.chatRoom = (req,res)=>{
    res.render('roomforchat', {RId: req.params.room, user: req.user});
}