

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

$("#teamRed").click(function(){
	clickedRed();
})

$("#teamBlu").click(function(){
	clickedBlu();
})

function clickedRed(){
	socket.emit('pickedTeam', {"team": "red"});
}

function clickedBlu(){
	socket.emit('pickedTeam', {"team": "blu"});
}

let whoami = "spectator";

socket.on('whoami', function(reply){
	if(reply == "redA" || reply == "redB"){
		$("#teamBlu").css("background-color", "grey");
		$("#teamRed").css("background-color", "grey");
		whoami = reply
	}
	else if(reply == "bluA" || reply == "bluB"){
		$("#teamBlu").css("background-color", "grey");
		$("#teamRed").css("background-color", "grey");
		whoami = reply
	}
	else if(reply == "chooseRed"){
		$("#teamBlu").css("background-color", "grey");
	}
	else if(reply == "chooseBlu"){
		$("#teamRed").css("background-color", "grey");
	}

});

socket.on("startGame", function(test){
	window.location.replace(`battle.html?whoami=${whoami}`);
});


function enteredName(){
	let username = $("#username").val();
	if(username.length == 0)
		return;
	$(".stage2").show();
	$(".stage1").hide();
	console.log(username);
}


