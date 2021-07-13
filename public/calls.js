const inp = document.getElementById('inp'),
    search = document.getElementById('search'),
    errr=document.getElementById('err'),
    callbox= document.getElementById('call-box'),
    callerImage= document.getElementById('callerImage'),
    callerName=document.getElementById('callerName'),
    callbtn= document.getElementById('callbtn'),
    u1ser= document.getElementById('u1ser'),
    socket = io.connect('https://teams-clone-a22solanki.herokuapp.com/');

let userToCall=null;
//search button functionality, if a user is found, this generates appropriate UI for calling
search.addEventListener('click', async (e)=>{
    e.preventDefault();
    const mail=inp.value;
    try{
        const res = await fetch('/calls', {
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({mail: mail})
        });
        const data= await res.json();
        if(data.err){
            errr.innerText=data.err;
            callbox.style.visibility="hidden";
            userToCall=null;
        }
        else{
            callbox.style.visibility="visible";
            callerImage.setAttribute('src', data.dp);
            callerName.innerText=data.name;
            userToCall=data.uid;
            errr.innerText="";
        }
    }catch(err){
        console.log(err);
    }
});

// calling button functionality
callbtn.addEventListener('click', async ()=>{
    try{
        const ress = await fetch('/callUser', {
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({userToCall})
        });
        const linkData= await ress.json();
        let mesgContent= u1ser.innerText+" has invited you to join a call. Use this link to join- https://teams-clone-a22solanki.herokuapp.com"+ linkData.link;
        let currentDate = new Date();
        let tim = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
        socket.emit('send-message', {
            mesContent: mesgContent,
            tim: tim,
            suid: linkData.userID,
            uid: userToCall
        });
        window.location.href=linkData.link;
    }catch(err){
        console.log(err);
    }

    
})
