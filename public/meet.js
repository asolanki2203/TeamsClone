const joinCall= document.getElementById('join-a-call'),
      inp= document.getElementById('inp'),
      err=document.getElementById('err'),
      createCall= document.getElementById('create-a-call'),
      input=document.getElementById('input'),
      joinAdmin=document.getElementById('join-as-admin');

joinCall.addEventListener('click', (e)=>{
    e.preventDefault();
    if(inp.value===""){
        err.innerText= "This field cannot be blank";
    }
    else{
        const link= "/group_call/"+inp.value;
        window.location.href=link;
    }
});

createCall.addEventListener('click', async (e)=>{
    e.preventDefault();
    if(input.innerText==="Your meeting code will appear here"){
        try{
            const res = await fetch('/createCall', {
                method: 'POST',
                headers: {'Accept': 'application/json', 'Content-Type': 'application/json' },
            });
            const data= await res.json();
            input.innerText=data.link;
            input.className="bg-gray-200 h-12 p-3 text-md text-gray-800";
            createCall.innerText="Copy";
            joinAdmin.style.visibility="visible";
            joinAdmin.setAttribute('href', "/group_call/"+input.innerText);
        }catch(err){
            console.log(err);
        }
    }else{
        await navigator.clipboard.writeText(input.innerText);
        createCall.innerText="Copied";
        createCall.className="bg-green-300 h-12 px-4 mt-1";
        await setTimeout(()=>{
            createCall.innerText="Copy";
            createCall.className="bg-blue-300 h-12 px-4 mt-1";
        },3000);
        
    }
    
});
