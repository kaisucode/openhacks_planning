
var socket = io.connect('http://localhost:5000');

socket.on('connect', function(){
	console.log("connection bridged");
});

socket.on('disconnect', function(){
	console.log("Disconnected from server");
});

var msg = "message from client";
socket.emit('my message', msg);

socket.on('chat message', function(msg){
	console.log("Received" + msg)
});

