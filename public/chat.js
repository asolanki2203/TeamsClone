const inp = document.getElementById('inp'),
    addChat = document.getElementById('addChat'),
    errr=document.getElementById('errr'),
    contacts= document.getElementById('contacts'),
    socket = io.connect('https://teams-clone-a22solanki.herokuapp.com/'),
    sendBtn= document.getElementById('sendBtn'),
    messageContent= document.getElementById('messageContent'),
    mesgs= document.getElementById('mesgs'),
    userImage= document.getElementById('user-image').getAttribute("src"),
    u1ser= document.getElementById('u1ser');

// let alchats= <%= alchats %>
let chatter2, chatter1;

//adding a new chat functionality
addChat.addEventListener('click', async (e)=>{
    e.preventDefault();
    const mail=inp.value;
    try{
        const res = await fetch('/addchat', {
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({mail: mail})
        });
        const data= await res.json();
        if(data.err){
            errr.innerText=data.err;
            errr.className="text-red-600";
        }
        else{
            errr.innerText="";
            window.location.reload();
            // console.log(data);
            /*  <li class="active bounceInDown">
                	<a href="#" class="clearfix">
                		<img src="https://bootdey.com/img/Content/user_1.jpg" alt="" class="img-circle">
                		<div class="friend-name">	
                			<strong>John Doe</strong>
                		</div>
                		<!-- <div class="last-message text-muted">Hello, Are you there?</div> -->
                	</a>
                </li>  */
        }
    }catch(err){
        console.log(err);
    }
});

//fetching a personal chat
let getPersonalChat= async (u)=>{
//     e.preventDefault();
    const sid= u;
    try{
        const resp= await fetch('/getPersonalChat', {
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({sid: sid})
        });
        const data = await resp.json();
        console.log(data);
        chatter1=data.sid;
        chatter2=data.uid;//sender
        // console.log(data);

        mesgs.innerHTML="";
        let n=data.messageArray.length;
        for(let i=0;i<n;i++){
            addnewmessage(data.messageArray[i]);
        };
    }catch(err){
        console.log(err);
    }
};

//handling new messages
socket.on('recieve-message', (data)=>{
    // console.log(data);console.log(data.da);
    addnewmessage(data.makeMessage);
})

//sending a msg button functionality, emits an event via socket.io
sendBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    const mesgContent= messageContent.value;
    let currentDate = new Date();
    let tim = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    socket.emit('send-message', {
        mesContent: mesgContent,
        tim: tim,
        suid: chatter2,
        uid: chatter1
    });
    messageContent.value="";
});

//generates appropriate UI for adding a new message
let addnewmessage= (message)=>{
    const chattieImage=document.getElementById('chattie-image').getAttribute('src'),
    u2ser= document.getElementById('u2ser');
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
    if(message.uidSender===chatter1){
        newmsgStrong.innerText=u1ser.innerText;
        newmsg.className="right clearfix";
        newmsgAvatar.setAttribute('src', userImage);
        newmsgspan.className="chat-img pull-right";
    }
    else{
        newmsgStrong.innerText=u2ser.innerText;
        newmsg.className="left clearfix";
        newmsgAvatar.setAttribute('src', chattieImage);
        newmsgspan.className="chat-img pull-left";
    }
    newmsgSmall.className="pull-right text-muted";
    newmsgdiv1.className="chat-body clearfix";
    newmsgdiv2.className="header";
    newmsgStrong.className="primary-font";
    newmsgSmall.innerText=message.time ;
    newmsgContent.innerText= message.content;

    newmsgdiv2.appendChild(newmsgStrong);
    newmsgdiv2.appendChild(newmsgSmall);
    newmsgdiv1.appendChild(newmsgdiv2);
    newmsgdiv1.appendChild(newmsgContent);
    newmsgspan.appendChild(newmsgAvatar);
    newmsg.appendChild(newmsgspan);
    newmsg.appendChild(newmsgdiv1);
    mesgs.prepend(newmsg);
}
