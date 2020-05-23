
var socket = io.connect('http://localhost:5000');

socket.on('connect', function(){
	console.log("connection bridged");
});

socket.on('disconnect', function(){
	console.log("Disconnected from server");
});

