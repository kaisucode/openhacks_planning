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
    "asteroids": { },
    "amoboxes": {
      "0": {"pos": vec(1,2,100), "vel": vec(0,0,0)}
    },
    "extralife": {"pos": {"x": 1, "y": 2, "z": 200}, "vel": vec(0,0,0)},
    "booleits": {
      "0": {"pos": {"x": 1, "y": 2, "z": 30}, "vel": vec(0,0,0)}
    }
  }
}

for (let i = 0; i < 10; i++){
  let r = (Math.random()+0.5)*20;
  game_environment.environment.asteroids[i+""] = {
    "pos": randvec(500), 
    "vel": vec(0,0,0), 
    "mass": Math.pow(r, 3)*0.1, 
    "r": r
  }
}

playerTaken = {
  "redA": null,
  "redB": null,
  "bluA": null,
  "bluB": null
}
// IMPORTANT: to add a new asteroid or somehting you should do something like game_environment.environment.asteroids[Math.max(...Object.keys(game_environment.environment.asteroids))] = {"pos": {"x": 1, "y": 40, "z": 3}, "vel": {"x": 1, "y": 2, "z": 3}, "mass": 7, "r": 30}


function booleitWithinBounds(booleitPos){
	return (booleitPos.x >= 0 && booleitPos.x <= 1000 &&
		booleitPos.y >= 0 && booleitPos.y <= 1000 &&
		booleitPos.z >= 0 && booleitPos.z <= 1000);
}

io.sockets.on('connection', function(socket){
	console.log("player connected");
	socket.emit("chat message", "GREETINGS FROM SERVER")
	socket.on('disconnect', function(){
		console.log("player disconnected");
	});

	socket.on('jumpydude', function(data){
    let player = data.whoami;
    let planetNormal = data.planetNormal;
    planetNormal = normalizeVec(planetNormal);
    scaleVec(planetNormal, -JUMP_VEL);
    game_environment[player].onPlanet = "-1";
    addToVec(game_environment[player].vel, planetNormal);
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
		let player_name = playerMovement.role;
    let player = game_environment[player_name];
    let asteroid = game_environment.environment.asteroids[player.onPlanet];

    let angles = carToSph(asteroid, player);
    if(playerMovement.direction == "up"){
      angles.phi -= 0.1;
    }
    if(playerMovement.direction == "left"){
      angles.theta -= 0.1;
    }
    if(playerMovement.direction == "down"){
      angles.phi += 0.1;
    }
    if(playerMovement.direction == "right"){
      angles.theta += 0.1;
    }

    copyBtoA(player.pos, sphToCar(angles, asteroid, player));
  });

  socket.on("requestRolesTaken", function(){
    socket.emit('updateRolesTaken', playerTaken); 
  });

  socket.on('shooting', function(action){
    let owner = action["owner"];

		newBooleit = {
			"pos": {...game_environment[owner].pos}, 
			"vel": action["vel"]
		};

		game_environment[owner]["booleits"]--;
		game_environment.environment.booleits[Math.max(...Object.keys(game_environment.environment.booleits))+1] = newBooleit;
	});

  setTimeout(update, 100);
  function update(){
		if(!startGame){
			setTimeout(update, 100);
			return;
		}

    const TOLERANCE = 1.1;
    for(p in PLAYERS){
      let player = PLAYERS[p];
      if(game_environment[player].onPlanet != "-1"){
        let asteroid = game_environment.environment.asteroids[game_environment[player].onPlanet];
        if(vecDiffMagSquared(game_environment[player].pos, asteroid.pos) > TOLERANCE*(sq(asteroid.r) + sq(RADIUS.player))){
          game_environment[player].onPlanet = "-1";
        }
      }
      for(i in game_environment.environment.asteroids){
        let asteroid = game_environment.environment.asteroids[i];
        if(vecDiffMagSquared(game_environment[player].pos, asteroid.pos) <= (sq(asteroid.r) + sq(RADIUS.player))*TOLERANCE){
          game_environment[player].onPlanet = i+"";
          scaleVec(game_environment[player].vel, 0);
          break;
        }
        else {
          let gP = GRAVITY*(MASS.player*asteroid.mass)/(Math.pow(vecDiffMagSquared(game_environment[player].pos, asteroid.pos), 3/4));
          let unnormalizedThing = vecDiff(asteroid.pos, game_environment[player].pos);
          let accel = vecMult(normalizeVec(unnormalizedThing), gP);

          addToVec(game_environment[player].vel, accel);
        }

        addToVec(game_environment[player].pos, game_environment[player].vel);
      }
    }

		for(i in game_environment.environment.booleits){
			addToVec(game_environment.environment.booleits[i].pos, vecMult(game_environment.environment.booleits[i].vel, 1));
		}

    for(let bi in game_environment.environment.booleits){
      let booleit = game_environment.environment.booleits[bi];
      for(let ai in game_environment.environment.asteroids){
        let asteroid = game_environment.environment.asteroids[ai];
        if(vecDiffMagSquared(asteroid.pos, booleit.pos) <= asteroid.r + RADIUS.booleits){
          delete game_environment.environment.booleits[bi];
					socket.emit("delBooleitFromScene", bi);
          break;
        }
      }
      for(let pi in PLAYERS){
        let player = game_environment[PLAYERS[pi]];
        if(vecDiffMagSquared(player.pos, booleit.pos) <= RADIUS.booleits + RADIUS.player){
          // you got hit notification? @KEVIN
          delete game_environment.environment.booleits[bi];
					socket.emit("delBooleitFromScene", bi);
          if(PLAYERS[pi] == "redA" || PLAYERS[pi] == "redB"){
            game_environment.redTeam.teamlives -= 1;
          }
          if(PLAYERS[pi] == "bluA" || PLAYERS[pi] == "bluB"){
            game_environment.bluTeam.teamlives -= 1;
          }
          break;
        }
      }
			if(!booleitWithinBounds(game_environment.environment.booleits[bi].pos)){
          delete game_environment.environment.booleits[bi];
					socket.emit("delBooleitFromScene", bi);
			}
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

