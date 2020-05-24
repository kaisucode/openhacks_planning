
// var socket = io.connect('http://doranelle.kevinhsu.net:5000');
var socket = io.connect('localhost:5000');

socket.on('connect', function(){
	console.log("connection bridged");
});

socket.on('disconnect', function(){
	console.log("Disconnected from server");
});

