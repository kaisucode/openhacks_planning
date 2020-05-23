
let port = 5000;

let express = require('express'); // needs this library
let app = express();
let server = require('http').createServer(app).listen(port);
let socket = require('socket.io');
let io = socket(server);
app.use(express.static('public'));

console.log("server running");
app.get('/', function(req, res){
	res.redirect("index.html");
});





io.sockets.on('connection', function(socket){
	console.log("connected");
	socket.emit("chat message", "HAIII FROM SERVER")
 
	socket.on('disconnect', function(){
		console.log("disconnect");
		// delete playerData[userId];
	});

})




