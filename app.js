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

function vec(x,y,z){
  return {"x": x, "y": y, "z": z};
}
function sq (number) {
  return number * number;
}
function vecMagSquared(v){
  return sq(v.x) + sq(v.y) + sq(v.z);
}
function vecMag(v){
  return Math.sqrt(vecMagSquared(v));
}
function vecDiff(a, b){
  return {"x": a.x-b.x, "y": a.y-b.y, "z": a.z-b.z};
}
function addToVec(a, b){
  a.x += b.x;
  a.y += b.y;
  a.z += b.z;
}
function vecMult(v, k){
  return {"x": v.x*k, "y": v.y*k, "z": v.z*k};
}
function normalizeVec(v){
  return vecMult(v, 1/vecMagSquared(v));
}
function vecDiffMagSquared(a, b){
  return vecMagSquared(vecDiff(a,b));
}
function vecToString(v){
  return `${v.x.toFixed(3)}, ${v.y.toFixed(3)}, ${v.z.toFixed(3)}`;
}


// constants, exist in both files
const MASS = {
  "player": 1,
  "booleits": 0.1,
  "amoboxes": 1,
  "extralife": 1
};

const RADIUS = {
  "player": 0.5,
  "booleits": 0.1,
  "extralife": 1,
  "amoboxes": 1
}
const PLAYERS = ["redA", "redB", "bluA", "bluB"];
// constants, exist in both files

let game_environment = {
  "redTeam": {
    "teamlives": 5
  },
  "bluTeam": {
    "teamlives": 5
  },
  "redA": { "booleits": 10, "pos": {"x": 1, "y": 2, "z": 3}, "vel": vec(0,0,0), "onPlanet": false },
  "redB": { "booleits": 10, "pos": {"x": 10, "y": 2, "z": 3}, "vel": vec(0,0,0), "onPlanet": false },
  "bluA": { "booleits": 10, "pos": {"x": -10, "y": 20, "z": 3}, "vel": vec(0,0,0), "onPlanet": false },
  "bluB": { "booleits": 10, "pos": {"x": 20, "y": 20, "z": 3}, "vel": vec(0,0,0), "onPlanet": false },
  "environment": {
    "asteroids": {
      "0": {"pos": {"x": 1, "y": 400, "z": 3}, "vel": {"x": 1, "y": 2, "z": 3}, "mass": 7, "r": 30},
      "1": {"pos": {"x": 1, "y": 40, "z": 3}, "vel": {"x": 1, "y": 2, "z": 3}, "mass": 7, "r": 30}
    },
    "amoboxes": {
      "0": {"pos": {"x": 1, "y": 2, "z": 100}, "vel": {"x": 1, "y": 2, "z": 3}}
    },
    "extralife": {"pos": {"x": 1, "y": 2, "z": 200}, "vel": {"x": 1, "y": 2, "z": 3}},
    "booleits": {
      "0": {"pos": {"x": 1, "y": 2, "z": 30}, "vel": {"x": 1, "y": 2, "z": 3}}
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
		}
	})

	socket.on("requestRolesTaken", function(){
		socket.emit('updateRolesTaken', playerTaken); 
	})

	socket.on('playerMovementOnPlanet', function(playerMovement){
		let player = playerMovement["role"];
		game_environment[player]["vel"] = playerMovement["vel"];
		console.log(`player ${player} moved`);
	});

	socket.on('shooting', function(action){
		let owner = action["owner"];
		let vel = action["vel"];
		console.log(`player ${owner} shot a booleit`);

		newBooleit = {
			"pos": game_environment[owner]["pos"], 
			"vel": vel
		};

		game_environment[owner]["booleits"]--;
		console.log(game_environment["environment"]["booleits"]);
		game_environment["environment"]["booleits"].push(newBooleit);
	});

  setTimeout(update, 100);
  function update(){
    for(p in PLAYERS){
      let player = PLAYERS[p];
      for(i in game_environment.environment.asteroids){
        let asteroid = game_environment.environment.asteroids[i];
        if(vecDiffMagSquared(game_environment[player].pos, asteroid.pos) <= 5*(sq(asteroid.radius) + sq(RADIUS.player))){
          game_environment[player].onPlanet = true;

          for(let i = 0; i < 100; i++)
            console.log("AYYYYAYYAYAYYAYAYAYAYAYAYAYYY YAYAYAYAYAYAYYAYAYAYY ON PLANNNNEETTE");
        }
        else {
          game_environment[player].onPlanet = false;

          let gP = (MASS.player*asteroid.mass)/(vecDiffMagSquared(game_environment[player].pos, asteroid.pos));
          let unnormalizedThing = vecDiff(asteroid.pos, game_environment[player].pos);
          let accel = vecMult(normalizeVec(unnormalizedThing), gP);

          addToVec(game_environment[player].vel, accel);
        }

        addToVec(game_environment[player].pos, game_environment[player].vel);
      }
    }

    let player = "redA";
    // console.log(`${player} vel: ${vecToString(game_environment[player].vel)}`);
    socket.emit("update", game_environment);
    setTimeout(update, 100);
  };
  update();


});

// function checkForAsteroidCollisions(){
//   if playerCollidesWith
	
// }

// Running timeout for bullet path and asteroid path and player path
// checkForAsteroidCollisons();
// checkForAmoboxCollisons();
// checkForExtralifeCollisons();

function sq (number) {
  return number * number;
}
function vecMagSquared(v){
  return sq(v.x) + sq(v.y) + sq(v.z);
}
function vecDiff(a, b){
  return {"x": a.x-b.x, "y": a.y-b.y, "z": a.z-b.z};
}
function vecDiffMagSquared(a, b){
  return vecMagSquared(vecDiff(a,b));
}

// setTimeout(update, 1000);
// function update(){
//   for(p in PLAYERS){
//     let player = PLAYERS[p];
//     for(i in game_environment.environment.asteroids){
//       let asteroid = game_environment.environment.asteroids[i];
//       if(vecDiffMagSquared(player, asteroid) <= sq(asteroid.radius) + sq()){
//       }
//   }
//   setTimeout(update, 1000);
// };



