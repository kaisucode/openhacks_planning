

var fs = require('fs');
eval(fs.readFileSync('public/src/general_functions.js')+'');
let port = 5000;

let startGame = true;
// By default startGame is false; will be toggled to true when four users log in
// This pauses the update sequence until the game starts

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
  "redA": { "booleits": 10, "pos": {"x": 1, "y": 2, "z": 3}, "vel": vec(0,0,0), "onPlanet": "-1" },
  "redB": { "booleits": 10, "pos": {"x": 10, "y": 2, "z": 3}, "vel": vec(0,0,0), "onPlanet": "-1" },
  "bluA": { "booleits": 10, "pos": {"x": 10, "y": 20, "z": 3}, "vel": vec(0,0,0), "onPlanet": "-1" },
  "bluB": { "booleits": 10, "pos": {"x": 20, "y": 20, "z": 3}, "vel": vec(0,0,0), "onPlanet": "-1" },
  "environment": {
    "asteroids": {
      "0": {"pos": {"x": 50, "y": 50, "z": 20}, "vel": vec(0,0,0), "mass": 7, "r": 5},
      "1": {"pos": {"x": 1, "y": 40, "z": 3}, "vel": vec(0,0,0), "mass": 7, "r": 5}
    },
    "amoboxes": {
      "0": {"pos": vec(1,2,100), "vel": vec(0,0,0)}
    },
    "extralife": {"pos": {"x": 1, "y": 2, "z": 200}, "vel": vec(0,0,0)},
    "booleits": {
      "0": {"pos": {"x": 1, "y": 2, "z": 30}, "vel": vec(0,0,0)}
    }
  }
}

playerTaken = {
  "redA": null,
  "redB": null,
  "bluA": null,
  "bluB": null
}
// IMPORTANT: to add a new asteroid or somehting you should do something like game_environment.environment.asteroids[Math.max(...Object.keys(game_environment.environment.asteroids))] = {"pos": {"x": 1, "y": 40, "z": 3}, "vel": {"x": 1, "y": 2, "z": 3}, "mass": 7, "r": 30}

io.sockets.on('connection', function(socket){
	console.log("connected");
	socket.emit("chat message", "GREETINGS FROM SERVER")
	socket.on('disconnect', function(){
		console.log("player disconnected");
	});

	socket.on('pickedTeam', function(choice){
		if(playerTaken[choice["player"]] == null){
			playerTaken[choice["player"]] = choice["username"];
			socket.broadcast.emit("playerTaken", {"role": choice["player"], "username": choice["username"]});
			socket.emit("playerTaken", {"role": choice["player"], "username": choice["username"]});
		}

		if(playerTaken["redA"] && playerTaken["redB"] && playerTaken["bluA"] && playerTaken["bluB"]){
			socket.broadcast.emit("startGame", "let the hunger games begin");
			socket.emit("startGame", "let the hunger games begin");
			let startGame = true;
		}
	});

	socket.on('playerMovementOnPlanet', function(playerMovement){
		let player = playerMovement.role;

    if(playerMovement.direction == "up"){
      game_environment[player].vel = vec(1,0,0);
    }
    if(playerMovement.direction == "left"){
      game_environment[player].vel = vec(-1,0,0);
    }
    if(playerMovement.direction == "down"){
      game_environment[player].vel = vec(0,1,0);
    }
    if(playerMovement.direction == "right"){
      game_environment[player].vel = vec(0,-1,0);
    }
  });

  socket.on("requestRolesTaken", function(){
    socket.emit('updateRolesTaken', playerTaken); 
  });

  socket.on('shooting', function(action){
    let owner = action["owner"];
    let vel = action["vel"];

    newBooleit = {
      "pos": game_environment[owner]["pos"], 
      "vel": vel
    };

		newBooleit = {
			"pos": game_environment[owner]["pos"], 
			"vel": vel
		};

		game_environment[owner]["booleits"]--;
		console.log(game_environment["environment"]["booleits"]);
		game_environment.environment.booleits[Math.max(...Object.keys(game_environment.environment.booleits))+1] = newBooleit;
	});

  setTimeout(update, 100);
  function update(){
		if(!startGame){
			setTimeout(update, 100);
			return;
		}

    for(p in PLAYERS){
      let player = PLAYERS[p];
      if(game_environment[player].onPlanet != "-1"){
        let asteroid = game_environment.environment.asteroids[game_environment[player].onPlanet];
        const TOLERANCE = 1.1;
        if(vecDiffMagSquared(game_environment[player].pos, asteroid.pos) > TOLERANCE*(sq(asteroid.r) + sq(RADIUS.player))){
          game_environment[player].onPlanet = "-1";
        }
      }
      for(i in game_environment.environment.asteroids){
        let asteroid = game_environment.environment.asteroids[i];
        if(vecDiffMagSquared(game_environment[player].pos, asteroid.pos) <= sq(asteroid.r) + sq(RADIUS.player)){
          game_environment[player].onPlanet = i+"";
          scaleVec(game_environment[player].vel, 0);
          break;
        }
        else {
          let gP = (MASS.player*asteroid.mass)/(vecDiffMagSquared(game_environment[player].pos, asteroid.pos));
          let unnormalizedThing = vecDiff(asteroid.pos, game_environment[player].pos);
          let accel = vecMult(normalizeVec(unnormalizedThing), gP);

          addToVec(game_environment[player].vel, accel);
        }

        addToVec(game_environment[player].pos, game_environment[player].vel);
      }
    }

		for(i in game_environment.environment.booleits){
			addToVec(game_environment.environment.booleits[i].pos, vecMult(game_environment.environment.booleits[i].vel, 0.01));


		}

    socket.emit("update", game_environment);
    setTimeout(update, 100);
  };
  update();


});

// Running timeout for bullet path and asteroid path and player path
// checkForAsteroidCollisons();
// checkForAmoboxCollisons();
// checkForExtralifeCollisons();

