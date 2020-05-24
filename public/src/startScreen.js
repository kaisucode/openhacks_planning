
let username = "spectator";
let whoami = "spectator";
let stage = 1;
$(".stage1").show();
$(".stage2").hide();

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
	var keyCode = event.which;
	if(keyCode == 13){
		if (stage == 1){
			enteredName();
		}
	}
}

$("#enter").click(function(){
	enteredName();
})

let receivedRole = false;

$("#redA").click(function(){ 
	if(!receivedRole)
		socket.emit('pickedTeam', {"player": "redA", "username": username}); 
})
$("#redB").click(function(){ 
	if(!receivedRole)
	socket.emit('pickedTeam', {"player": "redB", "username": username}); 
})
$("#bluA").click(function(){ 
	if(!receivedRole)
		socket.emit('pickedTeam', {"player": "bluA", "username": username}); 
})
$("#bluB").click(function(){ 
	if(!receivedRole)
		socket.emit('pickedTeam', {"player": "bluB", "username": username}); 
})


socket.on("playerTaken", function(player){
	$(`#${player["role"]}`).text(player["username"]);
	if(player["username"] == username){
		receivedRole = true;
		whoami = player["role"];
	}
});

socket.on("startGame", function(test){
	window.location.replace(`battle.html?whoami=${whoami}`);
});


function enteredName(){
	username = $("#username").val();
	if(username.length == 0)
		return;
	$(".stage2").show();
	$(".stage1").hide();

	// get names of roles chosen
	socket.emit('requestRolesTaken', "hai"); 
}

socket.on("updateRolesTaken", function(usernames){
	console.log(usernames);
	
	let roles = ["redA", "redB", "bluA", "bluB"];
	for(var role in usernames) {
		if(usernames[role] != null)
			$(`#${role}`).text(usernames[role]);
	}
});


