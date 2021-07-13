const express= require('express');
const session = require('express-session'); 
require('dotenv').config();
const socket= require('socket.io');
const mongoose = require('mongoose');
const passport = require('passport');
const facebookStrategy = require('passport-facebook').Strategy;
const passportSocketIo= require('passport.socketio');
const cookieParser= require('cookie-parser');

const indexRoutes= require('./routes/indexRoutes');
const homeRoutes= require('./routes/homeRoutes');
const callsRoutes= require('./routes/callsRoutes');
const chatRoutes= require('./routes/chatRoutes');
const meetRoutes= require('./routes/meetRoutes');
const roomRoutes= require('./routes/roomRoutes');
const User = require('./models/User');
const OneChat= require('./models/Onechat');

const sessionStore= new session.MemoryStore();

const app= express();

//process.env variables
let cid=process.env.cid;
let secrt=process.env.secrt;
let clientSecret=process.env.clientSecret;
let DB_ACCESS_USER=process.env.DB_ACCESS_USER;

//middlewares
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

app.use(session({secret: secrt, saveUninitialized: true, resave: true, key: 'express.sid', store: sessionStore}));
app.use(passport.initialize());
app.use(passport.session());

//fb strategy for authentication
passport.use(new facebookStrategy({
    clientID: cid,
    clientSecret: clientSecret, 
    callbackURL: "https://teams-clone-a22solanki.herokuapp.com/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email']
},
function(token, refreshToken, profile, done){
    process.nextTick(function(){
        User.findOne({ 'uid': profile.id}, (err, user)=>{
            if(err){
                return done(err);
            }
            if(user){
                // console.log("user found");
                // console.log(user);
                return done(null, user);
            }
            else{
                let newUser= new User();
                newUser.uid=profile.id;
                newUser.name= profile.name.givenName + ' ' + profile.name.familyName;
                newUser.email = profile.emails[0].value;
                newUser.dp = profile.photos[0].value;
                newUser.contacts = new Array();
                // newUsercontacts.push(welcomeMsg);
                newUser.save(function(err){
                    if(err) throw err;
                    return done(null, newUser);
                })
            }
        })
    })
}));

//serializing and deserialising users
passport.serializeUser(function(user, done){
    done(null, user.id);
    // done(null, user);
})
passport.deserializeUser(function(id,done){
    User.findById(id, function(err, user){
        done(err,user);
    });
    // return done(null,id);
});

//routes
app.use(indexRoutes);
app.use(homeRoutes);
app.use(callsRoutes);
app.use(chatRoutes);
app.use(meetRoutes);
app.use(roomRoutes);

//listen to requests
const dbURI = DB_ACCESS_USER;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
    .then((result)=>{
        const server= app.listen(process.env.PORT ||3000, ()=>{
            console.log("listening for requests on port 3000");
        }); 
        //socket setup
        const io=socket(server);
        //middleware to add user information to connected sockets
        io.use(
            passportSocketIo.authorize({
              cookieParser: cookieParser,
              key: 'express.sid',
            //   secret: process.env.SESSION_SECRET,
              secret: secrt,
              store: sessionStore,
            })
          );
          //listening for socket events
        io.on('connection', async (socket)=>{

            //video calling socket events handlers
            socket.on('join-room', (roomId, Id, userID)=>{
                socket.join(roomId);
                socket.broadcast.emit('user-connected', Id, userID);
                socket.on('sendID', data=>{
                    socket.broadcast.emit('idlele', {usID: data.usID});
                })

                socket.on('disconnect', ()=>{
                    socket.broadcast.emit('user-disconnected', Id);
                })
            })
            socket.on('sendInCallMsg', async (data)=>{
                let user= await User.findOne({uid: data.suid});
                io.in(data.RId).emit('newInCallMsg', {
                    user: user,
                    mesgContent: data.mesContent,
                    tim: data.tim
                });
            });

            // chat room socket events handlers
            socket.on('join-chat-room', async (roomID, userID)=>{
                socket.join(roomID);
                let user= await User.findOne({uid: userID});
                io.to(roomID).emit('user-connected', user);
                
                socket.on('send-message-in-room', async (data)=>{
                    let user= await User.findOne({uid: data.senderID});
                    let msg={
                        time: data.tim,
                        content: data.mesContent,
                        image: user.dp,
                        name: user.name,
                        uidSender: data.senderID
                    }
                    io.to(roomID).emit('new-message-in-room', msg);
                });

                socket.on('newPollAdded', poll=>{
                    io.to(roomID).emit('new-poll-in-room', poll);
                });

                socket.on('voteGiven', (data)=>{
                    io.to(roomID).emit('voted', data);
                })

                socket.on('disconnect', ()=>{
                    socket.broadcast.emit('user-disconnected');
                });
            })

            //sending messages socket handler, also updates the database with the message
            socket.on('send-message', async (data)=>{
                let makeMessage = {
                    uidReciever: data.suid,
                    uidSender: data.uid,
                    time: data.tim,
                    content: data.mesContent
                }
                // console.log(makeMessage);
                let thechat= await OneChat.findOne({uid: data.suid, suid: data.uid});
                let thechat2= await OneChat.findOne({uid: data.uid, suid: data.suid});
                let reciever= await User.findOne({uid: data.uid});console.log(reciever);
                reciever.contacts.forEach((c)=>{
                    if(c.suid===data.suid){
                        c.read=false;
                    }
                });
                await reciever.save();
                thechat.messages.push(makeMessage);
                await thechat.save();
                thechat2.messages.push(makeMessage);
                await thechat2.save();
                // sending msgs via sockets
                let clients = await io.fetchSockets();
                let siz=clients.length;
                for(let i=0;i<siz;i++){
                    if(clients[i].request.user.uid===data.uid||clients[i].request.user.uid===data.suid){
                        clients[i].emit('recieve-message', {makeMessage});
                    }
                }
            })
        })
    })
    .catch(err=> console.log(err));
