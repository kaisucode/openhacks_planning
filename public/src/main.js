const lightSpeed = 10;
const BULLET_SPEED = 5;
const center = new THREE.Vector3(0,0,0);

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
let gameenvLoaded = false;
let game_environment;

let cameraWorldDirection_holder = new THREE.Vector3(0,0,0);

let camControls;
let onPlanet_lookAngles = {"phi": 0, "theta": -Math.PI/2};
let onPlanet_lookPos = new THREE.Vector3(0,0,0);

let spectatorPos;

var camera = new THREE.PerspectiveCamera( 75, WIDTH / HEIGHT, 1, 1000 );
window.addEventListener('resize', function() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
});

const urlParams = new URLSearchParams(window.location.search);
let whoami = urlParams.get("whoami") || "spectator";

function generateBooleit(){
	camera.getWorldDirection(cameraWorldDirection_holder);

	newBooleitData = {
		"owner": whoami, 
		"vel": vecMult(cameraWorldDirection_holder, BULLET_SPEED)
	};
	let i = Math.max(...Object.keys(game_environment.environment.booleits))+1;
	let geometry = new THREE.SphereGeometry(RADIUS.booleits);

	let material = new THREE.MeshPhongMaterial({color: "red"});
	const cube = new THREE.Mesh(geometry, material);
	cube.position.x = game_environment[whoami]["pos"]["x"];
	cube.position.y = game_environment[whoami]["pos"]["y"];
	cube.position.z = game_environment[whoami]["pos"]["z"];
	scene.add(cube);
	booleits[i] = cube;
  update_HUD();

	socket.emit('shooting', newBooleitData);
}


//handles key presses, handleKeys is called in the update tick
var keysPressed = {};
var keysPressedTimes = {};
document.addEventListener("keyup", (event) => { keysPressed[event.key] = false; }, false);
document.addEventListener("keydown", (event) => { keysPressed[event.key] = true; }, false);
function handleKeys() {
  if(whoami != "spectator"){
    if(keysPressed[" "]){
      generateBooleit();
    }
    if(game_environment[whoami]["onPlanet"] != "-1"){
      if (keysPressed['w']) {
        socket.emit('playerMovementOnPlanet', {"role": whoami, "direction": "up"});
      }
      if (keysPressed['a']) {
        socket.emit('playerMovementOnPlanet', {"role": whoami, "direction": "left"});
      }
      if (keysPressed['s']) {
        socket.emit('playerMovementOnPlanet', {"role": whoami, "direction": "down"});
      }
      if (keysPressed['d']) {
        socket.emit('playerMovementOnPlanet', {"role": whoami, "direction": "right"});
      }
    }
    if(keysPressed["q"]){
      camera.rotateZ(0.01);
    }
    if(keysPressed["e"]){
      camera.rotateZ(-0.01);
    }
    if(keysPressed["p"]){
			socket.emit("reposition", {"floo": "says hai"});
    }
  }
  else{ // is spectator
    if (keysPressed['w']) {
      spectatorPos.y += 1;
    }
    if (keysPressed['a']) {
      spectatorPos.x -= 1;
    }
    if (keysPressed['s']) {
      spectatorPos.y -= 1;
    }
    if (keysPressed['d']) {
      spectatorPos.x += 1;
    }
    if(keysPressed["q"]){
      spectatorPos.z += 1;
    }
    if(keysPressed["e"]){
      spectatorPos.z -= 1;
    }
  }
}


var renderer = new THREE.WebGLRenderer();
let canvas = renderer.domElement;

renderer.setClearColor (0x000000, 1);
renderer.setSize(WIDTH, HEIGHT);

//handle mouse movement
canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
canvas.addEventListener("mousemove", cameraLook, false);

function cameraLook(e) {
  if(whoami != "spectator" && game_environment[whoami]["onPlanet"] != "-1"){
    onPlanet_lookAngles.phi -= e.movementY*0.001;

    let player = game_environment[whoami];
    let asteroid = game_environment.environment.asteroids[game_environment[whoami].onPlanet];
    let playerAngles = carToSph(player, asteroid);
    let centerTheta = playerAngles.theta;

    let candidate_newTheta = onPlanet_lookAngles.theta-e.movementX*0.01;
    // if((candidate_newTheta > centerTheta - Math.PI/40 || candidate_newTheta >
    //   onPlanet_lookAngles.theta) && (candidate_newTheta < centerTheta + Math.PI/40 ||
        // candidate_newTheta < onPlanet_lookAngles.theta)) {
       onPlanet_lookAngles.theta = candidate_newTheta;
    // }

    // angles should update based on the FOV

    copyBtoA(onPlanet_lookPos, sphToCarForCamera(onPlanet_lookAngles, asteroid, player));
  }
  else{
    camera.rotateY(-e.movementX/200);
    camera.rotateX(e.movementY/200);
  }
}

canvas.onclick = function() {
  canvas.requestPointerLock();

  if(whoami != "spectator"){
    if(game_environment[whoami].onPlanet != "-1"){
      let planetNormal = vecDiff(game_environment.environment.asteroids[game_environment[whoami].onPlanet].pos, game_environment[whoami].pos);
      socket.emit("jumpydude", {"planetNormal": planetNormal, "whoami": whoami});
    }
  }
};

canvas.id = "threejscanvas";
document.body.appendChild( canvas );

// canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
// canvas.requestPointerLock();

// canvas.style.cursor = "none";
var scene = new THREE.Scene();

let light = new THREE.AmbientLight(0xffffff);
scene.add(light);

let players = {};
let asteroids = {};
let booleits = {};

function initGameEnv(){
  for (let player in PLAYERS){
    let geometry = new THREE.BoxGeometry(RADIUS.player*2, RADIUS.player*2, RADIUS.player*2);
    let material = new THREE.MeshPhongMaterial({color: "#44aa88"});
    const cube = new THREE.Mesh(geometry, material);
    cube.rotation.x = Math.random()*Math.PI*2;
    cube.rotation.y = Math.random()*Math.PI*2;
    cube.rotation.z = Math.random()*Math.PI*2;

    cube.position.x = game_environment[PLAYERS[player]].pos.x;
    cube.position.y = game_environment[PLAYERS[player]].pos.y;
    cube.position.z = game_environment[PLAYERS[player]].pos.z;
    scene.add(cube);
    players[PLAYERS[player]] = cube;
  }

  if(whoami!= "spectator"){
    scene.add(camera);
    camera.position.x = players[whoami].position.x;
    camera.position.y = players[whoami].position.y;
    camera.position.z = players[whoami].position.z;
  }
  else{
    spectatorPos = vec(0,0,0);
  }

  for (let i in game_environment.environment.asteroids){
    let asteroid = game_environment.environment.asteroids[i];
    let geometry = new THREE.SphereGeometry(asteroid.r);
    let material = new THREE.MeshPhongMaterial({color: asteroid.color});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = asteroid.pos.x;
    cube.position.y = asteroid.pos.y;
    cube.position.z = asteroid.pos.z;
    scene.add(cube);
    asteroids[i] = cube;
  }

  for (let i in game_environment.environment.booleits){
    let booleit = game_environment.environment.booleits[i];
    let geometry = new THREE.SphereGeometry(RADIUS.booleits);
    let material = new THREE.MeshPhongMaterial({color: "red"});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = booleit.pos.x;
    cube.position.y = booleit.pos.y;
    cube.position.z = booleit.pos.z;
    scene.add(cube);
    booleits[i] = cube;
  }

  {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      "assets/stars.jpg",
      "assets/stars.jpg",
      "assets/stars.jpg",
      "assets/stars.jpg",
      "assets/stars.jpg",
      "assets/stars.jpg"
    ]);
    scene.background = texture;
  }

  update_HUD();

}


let ptLights = [];
let ptLightBlobs = [];
let ptLightVels = [];
let ptLightColors = ["#ffff00", "#0000ff", "#00ff00", "#ff0000", "#00FFFF", "#ffffff"];

for(let i in ptLightColors){
  ptLights.push( new THREE.PointLight( ptLightColors[i], 1, 0, 1) );
  scene.add(ptLights[i]);

  ptLightVels.push(new THREE.Vector3(Math.random(), Math.random(), Math.random()));
  ptLightVels[i].normalize();
  ptLightVels[i].multiplyScalar(lightSpeed);

  const geometry = new THREE.SphereGeometry(0.25, 32, 32);
  const material = new THREE.MeshPhongMaterial({color: ptLightColors[i], emissive: ptLightColors[i]});
  ptLightBlobs.push(new THREE.Mesh(geometry, material));
  scene.add(ptLightBlobs[i]);

  ptLights[i].position.set(2*(Math.random()-0.5)*grid_size, 2*(Math.random()-0.5)*grid_size, 2*(Math.random()-0.5)*grid_size);
  ptLightBlobs[i].position.copy(ptLights[i].position);
}

function alekRandomWalk(i){
  if (Math.random() < 0.003){
    ptLightVels[i].add(new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5));
    ptLightVels[i].normalize();
    ptLightVels[i].multiplyScalar(lightSpeed);
  }
  ptLights[i].position.add(ptLightVels[i]);

  if(ptLights[i].position.x < -grid_size || ptLights[i].position.x > grid_size ||
    ptLights[i].position.y < -grid_size || ptLights[i].position.y > grid_size ||
    ptLights[i].position.z < -grid_size || ptLights[i].position.z > grid_size){

    ptLightVels[i].subVectors(center, ptLights[i].position);
    ptLightVels[i].normalize();
    ptLightVels[i].multiplyScalar(lightSpeed);
    ptLights[i].position.add(ptLightVels[i]);
  }

  ptLightBlobs[i].position.copy(ptLights[i].position);
}

function update_HUD(){
  $("#hud").html("");
  for(let i=0; i < game_environment.redTeam.teamlives; i++){
      $("#hud").append(`<img style='position:absolute; top:1vh; left:${3.5*i}vw; width:3vw' src='assets/redLife.png'></img>`);
  }
  for(let i=0; i < game_environment.bluTeam.teamlives; i++){
      $("#hud").append(`<img style='position:absolute; top:1vh; right:${3.5*i}vw; width:3vw' src='assets/bluLife.png'></img>`);
  }
  if(whoami == "redA" || whoami == "redB"){
    $("#hud").append(`<p style='position:absolute; top:5vh; left:0; color: white; font-size: xx-large'>Booleits: ${game_environment[whoami].booleits}</p>`);
    $("#hud").append(`<p style='position:absolute; top:8vh; left:0; color: white; font-size: xx-large'>${whoami}</p>`);
  }
  if(whoami == "bluB" || whoami == "bluA"){
    $("#hud").append(`<p style='position:absolute; top:5vh; right:0; color: white; font-size: xx-large'>Booleits: ${game_environment[whoami].booleits}</p>`);
    $("#hud").append(`<p style='position:absolute; top:8vh; right:0; color: white; font-size: xx-large'>${whoami}</p>`);
  }
}

function animate() {
	requestAnimationFrame( animate );

  for(let player in players){
    copyBtoA(players[player].position, game_environment[player].pos);
  }
  camera.position.x = players[whoami].position.x;
  camera.position.y = players[whoami].position.y;
  camera.position.z = players[whoami].position.z;

  for(let booleit in booleits){
    if(game_environment.environment.booleits[booleit]){
      copyBtoA(booleits[booleit].position, game_environment.environment.booleits[booleit].pos);
    }
  }

  for(let i in ptLights){
    alekRandomWalk(i);
  }

	renderer.render( scene, camera );
}

socket.on("delBooleitFromScene", (booleitID)=>{
	scene.remove(booleits[booleitID]);
	delete booleits[booleitID];
	console.log("removed booleit from scene");
});

socket.on("playerGotHit", (player)=>{
	console.log(`${player} player got hit`);
});

socket.on("landedOnPlanet", (player)=>{
  if(player == whoami){
    alert("woot, i landed on the planet. just me, no oneelse should get this alert.");
    onPlanet_lookAngles.phi = 0;
    onPlanet_lookAngles.theta = -Math.PI/2;

    let player = game_environment[whoami];
    let asteroid = game_environment.environment.asteroids[game_environment[whoami].onPlanet];
    copyBtoA(onPlanet_lookPos, sphToCarForCamera(onPlanet_lookAngles, asteroid, player));
    camera.lookAt(onPlanet_lookPos);
  }
});

socket.on("someoneElseShot", (data)=>{
  console.log("someone shot!");
  console.log(data.who);
  if(data.who != whoami){
    let booleit = game_environment.environment.booleits[data.bulletId];
    let geometry = new THREE.SphereGeometry(RADIUS.booleits);
    let material = new THREE.MeshPhongMaterial({color: "red"});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = booleit.pos.x;
    cube.position.y = booleit.pos.y;
    cube.position.z = booleit.pos.z;
    scene.add(cube);
    booleits[i] = cube;
  }
})

socket.on('update', (new_game_environment)=>{
  game_environment = new_game_environment;
  handleKeys();
  if(!gameenvLoaded){
    gameenvLoaded = true;
    initGameEnv();
    animate();
  }

  if(whoami != "spectator"){
    if(game_environment[whoami]["onPlanet"] != "-1"){
      camera.lookAt(onPlanet_lookPos);
    }
  }

});

