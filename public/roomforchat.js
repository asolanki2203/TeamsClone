const socket = io.connect('https://teams-clone-a22solanki.herokuapp.com/'),
    sendBtn= document.getElementById('sendBtn'),
    messageContent= document.getElementById('messageContent'),
    mesgs= document.getElementById('mesgs'),
    addNewPoll=document.getElementById('addNewPoll'),
    addPollForm=document.getElementById('addPollForm'),
    newPollAddOption=document.getElementById('newPollAddOption'),
    newPollOptionsList=document.getElementById('newPollOptionsList'),
    addPollBtn=document.getElementById('addPollBtn'),
    newPollQuestion=document.getElementById('newPollQuestion'),
    optionOfNewPoll=document.getElementsByClassName('option-of-new-poll'),
    pollsList=document.getElementById('pollsList');

let pollVotes=[];
let lastVoted=null, lastVotedOptionNum=null, lastOp=null;
socket.emit('join-chat-room', roomID,  userID);

socket.on('user-connected', user=>{
    generateWelcome(user);
});

sendBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    const mesgContent= messageContent.value;
    let currentDate = new Date();
    let tim = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    socket.emit('send-message-in-room', {
        mesContent: mesgContent,
        tim: tim,
        senderID: userID,
        roomID: roomID
    });
    messageContent.value="";
});

socket.on('new-message-in-room', (msg)=>{
    // console.log(msg);
    addnewmessage(msg);
});

//poll functionality    
addNewPoll.addEventListener('click', (e)=>{
    e.preventDefault();
    if(addPollForm.style.visibility==="hidden") addPollForm.style.visibility="visible";
    else addPollForm.style.visibility="hidden"
});

newPollAddOption.addEventListener('click', (e)=>{
    e.preventDefault();
    let newOption= document.createElement('li');
    let newOptionInput =document.createElement('input');
    newOptionInput.setAttribute('placeholder', "Enter option");
    newOptionInput.className="p-2 border-2 rounded-sm mt-1 option-of-new-poll";
    newOption.appendChild(newOptionInput);
    newPollOptionsList.appendChild(newOption);
});

addPollBtn.addEventListener('click', (e)=>{
    let thisPollVotes=[];
    let question= newPollQuestion.value;
    addPollForm.style.visibility="hidden"
    let options= new Array();
    Array.from(optionOfNewPoll).forEach((e)=>{
        thisPollVotes.push(0);
        options.push(e.value);
    })
    let poll={
        options: options,
        question: question,
        votes: thisPollVotes
    }
    socket.emit('newPollAdded', poll);
});

socket.on('new-poll-in-room', (poll)=>{
    addnewpoll(poll);
});

let sendVote= function(optionNum, op){
    let data={
        optionNum, op, lastVoted, lastOp, lastVotedOptionNum
    }
    socket.emit('voteGiven', data);     
    lastOp=op;lastVotedOptionNum=optionNum;
    let idSt=`optionNum-${optionNum}`;
    lastVoted=idSt;
}

socket.on('voted', (data)=>{
    // console.log(optionNum); poll   
    if(data.lastVoted!==null){
        pollVotes[data.lastVotedOptionNum-1]--;
        // data.lastVoted.innerText=data.lastVotedOptionNum+") "+data.lastOp+"      "+pollVotes[data.lastVotedOptionNum-1]+ " votes";
        document.getElementById(data.lastVoted).innerText=data.lastVotedOptionNum+") "+data.lastOp+"      "+pollVotes[data.lastVotedOptionNum-1]+ " votes";
    }
    pollVotes[data.optionNum-1]++;
    let idSt=`optionNum-${data.optionNum}`;
    let thatOptionN=document.getElementById(idSt);
    thatOptionN.innerText=data.optionNum+") "+data.op+"      "+pollVotes[data.optionNum-1]+ " votes";
});

/*<div class="bg-white" style="visibility: visible; top: 22%; right: 8%; width: 320px; position: absolute;">
            <p class="bg-blue-600 text-white p-2 rounded-sm">Enter your Question</p>
            <input placeholder="Enter poll question" class="p-2 border-2 rounded-sm mt-1" style="width: 320px;">
            <!-- options -->
            <ul class="ml-4 p-2">
                <li><input placeholder="Enter option" class="p-2 border-2 rounded-sm mt-1"></li>
                <li><input placeholder="Enter option" class="p-2 border-2 rounded-sm mt-1"></li>
            </ul>
            <button class="bg-blue-600 text-white p-2 rounded-sm ml-4">Add Option</button>
            <button class="bg-green-700 text-white p-2 rounded-sm ml-4">Add Poll</button>
        </div>*/

let generateWelcome= (user)=>{
    let newWelcome=document.createElement('li');
    let welcome=document.createElement('p');
    welcome.innerText= "Everyone welcome "+user.name;
    newWelcome.prepend(welcome);
    mesgs.appendChild(newWelcome);
}

let addnewmessage= (message)=>{
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
    if(message.uidSender===userID){
        newmsgStrong.innerText=message.name;
        newmsg.className="right clearfix";
        newmsgAvatar.setAttribute('src', message.image);
        newmsgspan.className="chat-img pull-right";
    }
    else{
        newmsgStrong.innerText=message.name;
        newmsg.className="left clearfix";
        newmsgAvatar.setAttribute('src', message.image);
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

let addnewpoll= (poll)=>{
    let newP=document.getElementById('currPoll');
    let newPollQ=document.getElementById('currQ');
    let newPollOptionsL=document.getElementById('currOptionsList');
    newPollOptionsL.innerHTML="";
    // newP.setAttribute("data-pollNum", pollVotes.length+1);
    newPollQ.innerText=poll.question;
    let num=0;
    poll.options.forEach((op)=>{
        num++;pollVotes.push(0);
        let thatOption= document.createElement('li');
        let thatOptionName=document.createElement('button');
        let idStr=`optionNum-${num}`;
        thatOption.setAttribute('data-OptionNum', num);
        thatOption.setAttribute('onclick', `sendVote(${num}, "${op}")`);
        thatOptionName.setAttribute('id', idStr);
        thatOption.className="flex";
        thatOptionName.innerText=num+") "+op+"      "+poll.votes[num-1]+ " votes";
        thatOption.appendChild(thatOptionName);
        newPollOptionsL.appendChild(thatOption);
        thatOption.setAttribute("data-OptionNum", num);
    });
}

 
