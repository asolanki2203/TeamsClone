//we have access to socket.io here as we included it in our main file
const socket = io.connect('http://localhost:3000/'),
    videoGrid= document.getElementById('video-grid'),
    muteAudio = document.getElementById('muteAudio'),
    muteVideo= document.getElementById('muteVideo'),
    endCall = document.getElementById('endCall'),
    muteAudioimg= document.getElementById('muteAudioimg'),
    muteVideoimg=document.getElementById('muteVideoimg'),
    screenshare=document.getElementById('shareScreen'),
    screenShareimg = document.getElementById('screenShareimg'),
    chatWindow=document.getElementById('chatWindow'),
    chatTab=document.getElementById('chatTab'),
    sendBtn= document.getElementById('sendBtn'),
    messageContent= document.getElementById('messageContent'),
    mesgs= document.getElementById('mesgs'),
    closeBtn= document.getElementById('close-btn');

var str=null;
var peers={}
var currPeer, chatter1=null;

const myVideo= document.createElement('video');
myVideo.muted= true;

//mute audio and video functionality
let aud=true, vid=true, ss=false;

const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

myPeer.on('open', id=>{
    //emitting join room event
    socket.emit('join-room', RId, id, userID);
})

const getUserMedia= navigator.mediaDevices.getUserMedia;

socket.on('idlele', data=>{
    chatter1=data.usID;
})

getUserMedia({
    video: true,
    audio: true
}).then((stream)=>{
    str=stream;
    addVideoStream(myVideo, str);
    // myVid.append(myVideo);

    socket.on('user-connected', (Id, userID)=>{
        // console.log("User connected: " + userId );
        chatter1=userID;
        connectToNewUser(Id, str);
    })
})

//diconnecting users
socket.on('user-disconnected', userId=>{
    if(peers[userId]) peers[userId].close();
    // window.location.href="/";
})

myPeer.on('call', (call)=>{
    getUserMedia({
        video: true,
        audio: true
    }).then((stream) =>{
        str=stream;
        call.answer(str);
        console.log(call.metadata.uid);
        peers[call.metadata.uid]=call;
        const video= document.createElement('video');
        call.on('stream', userVideoStream =>{
            addVideoStream(video, userVideoStream);
            currPeer=call.peerConnection;
            // secVid.append(video);
        });
    })
})

muteAudio.onclick = function(){
    aud=!aud;
    if(aud){
        muteAudioimg.setAttribute("src", "/images/mute-icon.png");
    }
    else{
        muteAudioimg.setAttribute("src", "/images/muted-icon.png");
    }
    str.getAudioTracks()[0].enabled=aud;
}

muteVideo.onclick = function(){
    vid=!vid;
    if(vid){
        muteVideoimg.setAttribute("src", "/images/videomicon.png");
    }
    else{
        muteVideoimg.setAttribute("src", "/images/videomutedicon.png");
    }
    str.getVideoTracks()[0].enabled=vid;
}

//chat functionality
chatWindow.addEventListener('click', (e)=>{
    e.preventDefault();
    if(chatTab.style.visibility==="visible"){
        chatTab.style.visibility="hidden";
        videoGrid.style.marginLeft="13%";
    }else{
        chatTab.style.visibility="visible";
        videoGrid.style.marginLeft="2%";
    }
});

closeBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    chatTab.style.visibility="hidden";
    videoGrid.style.marginLeft="13%";
})

sendBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    const mesgContent= messageContent.value;
    let currentDate = new Date();
    let tim = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    socket.emit('sendInCallMsg', {
        mesContent: mesgContent,
        tim: tim,
        suid: userID,
        RId: RId
    })
    messageContent.value="";
});

socket.on('newInCallMsg', (data)=>{
    addnewmessage(data);
})

//end call
endCall.onclick = function(){
    // if(peers[userID]) peers[userID].close();
    // socket.emit('disconnect');
    window.location.href="/";
}

//screen share
screenshare.onclick = function(){
    ss=!ss;
    if(ss){
        screenShareimg.setAttribute("src", "/images/screenshareyes.png");
        navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: "always"
            },
            audio: {
                echoCancellation: true,
                noiseSupression: true
            }
        }).then(stream =>{
            const videoTrack = stream.getVideoTracks()[0];
            videoTrack.onended = function(){
                stopScreenShare();
                secVid.style.transform= "rotateY(180deg)";
                screenShareimg.setAttribute("src", "/images/screenshareno.png");
                ss=false;
            }
            const sender= currPeer.getSenders().find(function(s){
                return s.track.kind === videoTrack.kind;
            });
            sender.replaceTrack(videoTrack);
        }).catch(err=>{
            screenShareimg.setAttribute("src", "/images/screenshareno.png");
            console.log("Unable to share screen");
        })
    }
    else{
        screenShareimg.setAttribute("src", "/images/screenshareno.png");
        stopScreenShare();
    }
}

function stopScreenShare(){
    var videoTrack = str.getVideoTracks()[0];
    var sender = currPeer.getSenders().find(function(s){
         return s.track.kind==videoTrack.kind;
    })
    sender.replaceTrack(videoTrack);
}

function addVideoStream(video, stream){
    video.srcObject=stream;
    video.addEventListener('loadedmetadata', ()=>{
        video.play();
    });
    videoGrid.append(video);
}

function connectToNewUser(userId, str){
    const call= myPeer.call(userId, str, {
        metadata: {uid: myPeer.id},
    });
    // str=stream;
    socket.emit('sendID', {usID: userID});
    const secVid=document.createElement('video');
    call.on('stream', (userVideoStream) => {
        addVideoStream(secVid, userVideoStream);
        currPeer=call.peerConnection;
    })
    peers[userId]=call;
    call.on('close', ()=>{
        secVid.remove();
    })
}

let addnewmessage= (data)=>{
    const chattieImage=data.user.dp;
    let newmsg= document.createElement('li');
    let newmsgspan =document.createElement('span');
    let newmsgAvatar= document.createElement('img');
    let newmsgdiv1=document.createElement('div');
    let newmsgdiv2=document.createElement('div');
    let newmsgStrong = document.createElement('strong');
    let newmsgSmall= document.createElement('small');
    let newmsgContent= document.createElement('p');

    newmsg.className="right clearfix";
    newmsgspan.className="chat-img pull-right";
    if(data.user.uid===userID){
        newmsgStrong.innerText=data.user.name;
        newmsg.className="right clearfix";
        newmsgAvatar.setAttribute('src', chattieImage);
        newmsgspan.className="chat-img pull-right";
    }
    else{
        newmsgStrong.innerText=data.user.name;
        newmsg.className="left clearfix";
        newmsgAvatar.setAttribute('src', chattieImage);
        newmsgspan.className="chat-img pull-left";
    }
    newmsgSmall.className="pull-right text-muted";
    newmsgdiv1.className="chat-body clearfix";
    newmsgdiv2.className="header";
    newmsgStrong.className="primary-font";
    newmsgSmall.innerText=data.tim ;
    newmsgContent.innerText= data.mesgContent;

    newmsgdiv2.appendChild(newmsgStrong);
    newmsgdiv2.appendChild(newmsgSmall);
    newmsgdiv1.appendChild(newmsgdiv2);
    newmsgdiv1.appendChild(newmsgContent);
    newmsgspan.appendChild(newmsgAvatar);
    newmsg.appendChild(newmsgspan);
    newmsg.appendChild(newmsgdiv1);
    mesgs.prepend(newmsg);
}