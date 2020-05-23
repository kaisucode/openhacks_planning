
let port = 5000;

let express = require('express'); // needs this library
let app = express();
let server = require('http').createServer(app).listen(port);
let socket = require('socket.io');
let io = socket(server);
app.use(express.static('public'));

console.log(`server running on port ${port}`);
app.get('/', function(req, res){
	res.redirect("index.html");
});



let game_environment = {
  "redTeam": {
    "teamlives": 5
  },
  "bluTeam": {
    "teamlives": 5
  },
  "redA": { "booleits": 10, "pos": {"x": 1, "y": 2, "z": 3}, "vel": {"x": 1, "y": 2, "z": 3} },
  "redB": { "booleits": 10, "pos": {"x": 10, "y": 2, "z": 3}, "vel": {"x": 1, "y": 2, "z": 3} },
  "bluA": { "booleits": 10, "pos": {"x": -10, "y": 20, "z": 3}, "vel": {"x": 1, "y": 2, "z": 3} },
  "bluB": { "booleits": 10, "pos": {"x": 20, "y": 20, "z": 3}, "vel": {"x": 1, "y": 2, "z": 3} },
  "environment": {
    "asteroids": [
      {"pos": {"x": 1, "y": 200, "z": 3}, "vel": {"x": 1, "y": 2, "z": 3}, "mass": 4},
      {"pos": {"x": 1, "y": 300, "z": 3}, "vel": {"x": 1, "y": 2, "z": 3}, "mass": 6},
      {"pos": {"x": 1, "y": 400, "z": 3}, "vel": {"x": 1, "y": 2, "z": 3}, "mass": 7}
    ],
    "amoboxes": [
      {"pos": {"x": 1, "y": 2, "z": 100}, "vel": {"x": 1, "y": 2, "z": 3}},
    ],
    "extralife": {"pos": {"x": 1, "y": 2, "z": 200}, "vel": {"x": 1, "y": 2, "z": 3}},
    "booleits": [
      {"pos": {"x": 1, "y": 2, "z": 300}, "vel": {"x": 1, "y": 2, "z": 3}}
    ]
  }
}


io.sockets.on('connection', function(socket){
	console.log("connected");
	socket.emit("chat message", "GREETINGS FROM SERVER")
	socket.on('disconnect', function(){
		console.log("player disconnected");
	});

	socket.on('movement', function(playerMovement){
		let player = playerMovement["role"];
		game_environment[player]["vel"] = playerMovement["vel"];
		// checkForAsteroidCollisons();
		// checkForAmoboxCollisons();
		// checkForExtralifeCollisons();
	});

	socket.on('shooting', function(action)){
		let owner = action["owner"];
		let vel = action["vel"];

		newBooleit = {
			"pos": game_environment[owner]["pos"], 
			"vel": vel
		};

		game_environment[owner]["booleits"]--;
		game_environment["booleits"].push(newBooleit);
	}

})

// function checkForAsteroidCollisions(){
//   if playerCollidesWith
	
// }

// Running timeout for bullet path and asteroid path and player path



