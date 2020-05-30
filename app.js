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
  "redA": { "booleits": 10, "pos": {"x": 1, "y": 2, "z": 3}, "vel": vec(0,0,0), "onPlanet": "-1", "lifting_off": false, "lift_direction": vec(1,0,0)},
  "redB": { "booleits": 10, "pos": {"x": 10, "y": 2, "z": 3}, "vel": vec(0,0,0), "onPlanet": "-1", "lifting_off": false, "lift_direction": vec(1,0,0)},
  "bluA": { "booleits": 10, "pos": {"x": 10, "y": 20, "z": 3}, "vel": vec(0,0,0), "onPlanet": "-1", "lifting_off": false, "lift_direction": vec(1,0,0)},
  "bluB": { "booleits": 10, "pos": {"x": 20, "y": 20, "z": 3}, "vel": vec(0,0,0), "onPlanet": "-1", "lifting_off": false, "lift_direction": vec(1,0,0)},
  "environment": {
    "asteroids": { },
    "amoboxes": {
      "0": {"pos": vec(1,2,100), "vel": vec(0,0,0)}
    },
    "extralife": {"pos": {"x": 1, "y": 2, "z": 200}, "vel": vec(0,0,0)},
    "booleits": { }
  }
};

let num_booleits_shot = 0;
let emit_booleit_queue = [];

for (let i = 0; i < 30; i++){
  let r = (Math.random()+0.5)*50+50;
  let randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});

  game_environment.environment.asteroids[i+""] = {
    "pos": randvec(grid_size), 
    "vel": vec(0,0,0), 
    "mass": 10*Math.pow(r, 0.11), 
    "r": r, 
    "color": randomColor
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
	return (booleitPos.x >= -grid_size && booleitPos.x <= grid_size &&
		booleitPos.y >= -grid_size && booleitPos.y <= grid_size &&
		booleitPos.z >= -grid_size && booleitPos.z <= grid_size);
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

    game_environment[player].liftingOff = true;
    game_environment[player].lift_direction = planetNormal;
    setTimeout(()=>{game_environment[player].liftingOff = false}, 1500);

    game_environment[player].onPlanet = "-1";
    // addToVec(game_environment[player].pos, vecMult(planetNormal, JUMP_DIST));
    // game_environment[player].vel = vecMult(planetNormal, JUMP_VEL);
    // console.log(game_environment[player].vel);
	});

	socket.on('reposition', function(choice){
		console.log("REPOSITIONING");
		game_environment["redA"].pos = {"x": 1, "y": 2, "z": 3};
		game_environment["redB"].pos = {"x": 10, "y": 2, "z": 3};
		game_environment["bluA"].pos = {"x": 10, "y": 20, "z": 3};
		game_environment["bluB"].pos = {"x": 20, "y": 20, "z": 3};
    for(p in PLAYERS){
      let player = PLAYERS[p];
			game_environment[player].vel = {"x": 0, "y": 0, "z": 0};
		}
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
		if(player.onPlanet != "-1"){
			let asteroid = game_environment.environment.asteroids[player.onPlanet];

			let angles = carToSph(asteroid, player);
			if(playerMovement.direction == "up"){
				angles.phi -= 0.01;
			}
			if(playerMovement.direction == "left"){
				angles.theta -= 0.01;
			}
			if(playerMovement.direction == "down"){
				angles.phi += 0.01;
			}
			if(playerMovement.direction == "right"){
				angles.theta += 0.01;
			}
			copyBtoA(player.pos, sphToCar(angles, asteroid, player));
		}
  });

  socket.on("requestRolesTaken", function(){
    socket.emit('updateRolesTaken', playerTaken); 
  });

  socket.on('booleitShot', function(booleit_data){
    let owner = booleit_data["owner"];
		game_environment[owner]["booleits"]--;

    let newBooleitId = num_booleits_shot+"";
    num_booleits_shot += 1;
		game_environment.environment.booleits[newBooleitId] = { 
      "pos": copyVec(game_environment[owner].pos), 
      "vel": booleit_data["vel"],
      "shotby": owner
    };

    emit_booleit_queue.push(newBooleitId);
	});

});


function update(){
  if(!startGame){
    setTimeout(update, 100);
    return;
  }

  const TOLERANCE = 1.1;
  for(p in PLAYERS){
    let player = PLAYERS[p];

    if(game_environment[player].liftingOff){
      addToVec(game_environment[player].vel, vecMult(game_environment[player].lift_direction, JUMP_ACCEL));
    }
  
    if(vecMag(game_environment[player].pos) > 2000) {
      scaleVec(game_environment[player].pos, 0);
      scaleVec(game_environment[player].vel, 0);
    }

    if(game_environment[player].onPlanet != "-1"){
      let asteroid = game_environment.environment.asteroids[game_environment[player].onPlanet];
      if(vecDiffMagSquared(game_environment[player].pos, asteroid.pos) > (sq(asteroid.r) + sq(RADIUS.player))){
        game_environment[player].onPlanet = "-1";
      }
    }
    for(i in game_environment.environment.asteroids){
      let asteroid = game_environment.environment.asteroids[i];
      if(vecDiffMagSquared(game_environment[player].pos, asteroid.pos) <= (sq(asteroid.r) + sq(RADIUS.player))*TOLERANCE){
        game_environment[player].onPlanet = i+"";
        scaleVec(game_environment[player].vel, 0);
        io.emit("landedOnPlanet", {"player": player});
        break;
      }
      else {
        let gP = Math.abs(GRAVITY*(MASS.player*asteroid.mass)/(Math.pow(vecDiffMagSquared(game_environment[player].pos, asteroid.pos), 1.2)));
        let unnormalizedThing = vecDiff(asteroid.pos, game_environment[player].pos);
        let accel = vecMult(normalizeVec(unnormalizedThing), gP);

        addToVec(game_environment[player].vel, accel);
      }
    }
    addToVec(game_environment[player].pos, game_environment[player].vel);
  }

  for(let bi in game_environment.environment.booleits){
    addToVec(game_environment.environment.booleits[bi].pos, vecMult(game_environment.environment.booleits[bi].vel, 1));

    let booleit = game_environment.environment.booleits[bi];
    // for(let ai in game_environment.environment.asteroids){
    //   let asteroid = game_environment.environment.asteroids[ai];
    //   if(vecDiffMagSquared(asteroid.pos, booleit.pos) <= asteroid.r + RADIUS.booleits){
    //     // io.emit("delBooleitFromScene", bi);
    //     // delete game_environment.environment.booleits[bi];
    //     break;
    //   }
    // }
    for(let pi in PLAYERS){
      let player = game_environment[PLAYERS[pi]];
      if(booleit.shotby != PLAYERS[pi] && vecDiffMagSquared(player.pos, booleit.pos) <= RADIUS.booleits + RADIUS.player){
        // you got hit notification? @KEVIN
        io.emit("playerGotHit", PLAYERS[pi]);
        io.emit("delBooleitFromScene", bi);
        delete game_environment.environment.booleits[bi];
        if(PLAYERS[pi] == "redA" || PLAYERS[pi] == "redB"){
          game_environment.redTeam.teamlives -= 1;
        }
        if(PLAYERS[pi] == "bluA" || PLAYERS[pi] == "bluB"){
          game_environment.bluTeam.teamlives -= 1;
        }
        break;
      }
    }
    if(!booleitWithinBounds(booleit.pos)){
      io.emit("delBooleitFromScene", bi);
      delete game_environment.environment.booleits[bi];
      break;
    }
  }

  if(emit_booleit_queue.length > 0)
    console.log(JSON.stringify(emit_booleit_queue));

  io.emit("update", {"game_environment": game_environment, "new_booleits": emit_booleit_queue.splice(0)});
  setTimeout(update, 100);
};
update();

