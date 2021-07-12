const joinRoom= document.getElementById('join-a-room'),
      inp= document.getElementById('inp'),
      err=document.getElementById('err'),
      createRoom= document.getElementById('create-a-room'),
      input=document.getElementById('input'),
      joinAdmin=document.getElementById('join');

//joining a room functionality, simply generates the appropriate room url from a room code      
joinRoom.addEventListener('click', (e)=>{
    e.preventDefault();
    if(inp.value===""){
        err.innerText= "This field cannot be blank";
    }
    else{
        const link= "/chat_room/"+inp.value;
        window.location.href=link;
    }
});

createRoom.addEventListener('click', async (e)=>{
    e.preventDefault();
    if(input.innerText==="Your room code will appear here"){
        try{
            const res = await fetch('/createRoom', {
                method: 'POST',
                headers: {'Accept': 'application/json', 'Content-Type': 'application/json' },
            });
            const data= await res.json();
            console.log(data);
            input.innerText=data.link;
            input.className="bg-gray-200 h-12 p-3 text-md text-gray-800";
            createRoom.innerText="Copy";
            joinAdmin.style.visibility="visible";
            joinAdmin.setAttribute('href', "/chat_room/"+input.innerText);
        }catch(err){
            console.log(err);
        }
    }else{
        await navigator.clipboard.writeText(input.innerText);
        createRoom.innerText="Copied";
        createRoom.className="bg-green-300 h-12 px-4 mt-1";
        await setTimeout(()=>{
            createRoom.innerText="Copy";
            createRoom.className="bg-blue-300 h-12 px-4 mt-1";
        },3000);
        
    }
    
});
