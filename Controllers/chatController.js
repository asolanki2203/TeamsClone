const Onechat = require('../models/Onechat'),
      User= require('../models/User');


// get all the chats  handler
module.exports.getChat = (req, res)=>{
    let contactsArray= req.user.contacts, aid= req.user.uid;
    res.render('chat', {user: req.user, arr: contactsArray}); 
};

//adding a new chat, creates new Onechat and a new user in the contacts Array, also checks if a chat with that user is already present
module.exports.addChat = async (req, res)=>{
    const {mail}= req.body;
    try{
        const user1=await User.findOne({email: req.user.email});
        const user2= await User.findOne({email: mail});
        if(mail===req.user.email) res.status(400).json({err: "No sense of chatting with yourself :)"});
        else if(user2===null) res.status(400).json({err: "No user with that email exists"});
        else{
            let exists = false;
            user1.contacts.forEach((u)=>{
                if(u.suid.toString() === user2.uid.toString()){
                    exists=true;
                }
            });
            // console.log(exists);
            if(!exists){
                const userToBeAdded1= {
                    suid: user2.uid,
                    // semail: user2.email,
                    sname: user2.name,
                    sdp: user2.dp,
                    read: false
                }
                const userToBeAdded2= {
                    suid: user1.uid,
                    // semail: user1.email,
                    sname: user1.name,
                    sdp: user1.dp,
                    read: false
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
                res.status(201).json({a1chat: a1chat});
            }
            else{
                res.status(400).json({err: "Chat with this user already exists"});
            }
        }
    }
    catch(err){
        console.log(err);
        res.status(400).json({err});
    }
}

//getting a chat handler, searches the database and returns the required data
module.exports.getPersonalChat = async (req,res)=>{
    const {sid}= req.body;
    const uid= req.user.uid;
    try{
        // const suser= await User.findOne({uid: sid});
        const user= await User.findOne({uid: uid});
        user.contacts.forEach((c)=>{
            if(c.suid===sid){
                c.read=true;
            }
        });
        await user.save();
        const chat= await Onechat.findOne({uid: uid, suid: sid});
        res.status(200).json({messageArray: chat.messages, sid: sid, uid: req.user.uid});
    }catch(err){
        console.log(err);
    }
}