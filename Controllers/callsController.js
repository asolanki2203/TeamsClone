const User = require('../models/User');
const Onechat= require('../models/Onechat');

//uuid library function to generate random urls
const { v4: uuidv4 }= require('uuid');

//fetch a user and display it
module.exports.getUser = async (req, res)=>{
    const {mail}= req.body;
    try{
        const user= await User.findOne({email: mail});
        if(user===null) res.status(400).json({err: "No user with that email exists"});
        else if(mail===req.user.email) res.status(400).json({err: "No sense of calling yourself :)"});
        else res.status(201).json({dp: user.dp, name: user.name, uid: user.uid});
    }
    catch(err){
        // console.log(err);
        res.status(400).json({err});
    }
}

let link= `/video_call/${uuidv4()}`;

//get Video Room handler
module.exports.getVideoRoom = (req,res)=>{
    res.redirect(link);
}

//get Video Room handler
module.exports.enterVideoRoom = (req,res)=>{
    res.render('video_room', {userID: req.user.uid, roomId: req.params.room});
};

//calling a user, this function also creates a new chat between the 2 users if there isn't one
module.exports.callUser= async (req,res)=>{
    const {userToCall}= req.body;
    const user1=await User.findOne({email: req.user.email});
        const user2= await User.findOne({uid: userToCall});
    let exists = false;
    user1.contacts.forEach((u)=>{
        if(u.suid.toString() === user2.uid.toString()){
            exists=true;
        }
    });
    if(!exists){
        const userToBeAdded1= {
            suid: user2.uid,
            // semail: user2.email,
            sname: user2.name,
            sdp: user2.dp
        }
        const userToBeAdded2= {
            suid: user1.uid,
            // semail: user1.email,
            sname: user1.name,
            sdp: user1.dp
        }
        user1.contacts.push(userToBeAdded1);
        user2.contacts.push(userToBeAdded2);
        let a1chat= new Onechat();
        a1chat.uid= req.user.uid;
        a1chat.suid=user2.uid;
        await a1chat.save();
        let a2chat= new Onechat();
        a2chat.uid= user2.uid;
        a2chat.suid=req.user.uid;
        await a2chat.save();
        await user1.save();
        await user2.save();
    }
    res.status(200).json({userID: req.user.uid, link: link});
}