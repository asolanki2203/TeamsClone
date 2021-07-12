const User = require('../models/User');
const { v4: uuidv4 }= require('uuid');

module.exports.createCall= (req,res)=>{
    const link= `${uuidv4()}`
    res.status(200).json({link});
}

module.exports.groupCall = (req,res)=>{
    res.render('groupCall', {RId: req.params.room, user: req.user});
}