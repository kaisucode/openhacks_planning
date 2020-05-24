const speed = 0.4;
const lightSpeed = 0.03;
const dim = 100;
const center = new THREE.Vector3(dim/2,dim/2,dim/2);
let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
let gameenvLoaded = false;
let game_environment;

// constants, exist in both files
const MASS = {
  "player": 0.1,
  "booleits": 0.1,
  "amoboxes": 1,
  "extralife": 1
};

const RADIUS = {
  "player": 1,
  "booleits": 0.1,
  "extralife": 1,
  "amoboxes": 1
}
const PLAYERS = ["redA", "redB", "bluA", "bluB"];
// constants, exist in both files

var camera = new THREE.PerspectiveCamera( 75, WIDTH / HEIGHT, 1, 1000 );
window.addEventListener('resize', function() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
});

let whoami = "redA";
let heading =  {"x": 1, "y": 2, "z": 3};

function shooting(){
	let booleitVel = {
		"x": game_environment[whoami]["pos"]["x"] + heading["x"], 
		"y": game_environment[whoami]["pos"]["y"] + heading["y"], 
		"z": game_environment[whoami]["pos"]["z"] + heading["z"]
	};

	updatedBooleitData = {
		"owner": whoami, 
		"vel": booleitVel
	};
	socket.emit('shooting', updatedBooleitData);
}


var keysPressed = {};
var keysPressedTimes = {};
document.addEventListener("keyup", (event) => { keysPressed[event.key] = false; }, false);
document.addEventListener("keydown", (event) => { keysPressed[event.key] = true; }, false);


function handleKeys() {
  if(game_environment[whoami]["onPlanet"]){
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
  if(keysPressed[" "]){
    shooting();
  }
  if(keysPressed["q"]){
    camera.rotateZ(0.01);
  }
  if(keysPressed["e"]){
    camera.rotateZ(-0.01);
  }
}

var renderer = new THREE.WebGLRenderer();
let canvas = renderer.domElement;

renderer.setClearColor (0x000000, 1);
renderer.setSize(WIDTH, HEIGHT);
// canvas.addEventListener("mousemove", evt=> {
//   var rect = canvas.getBoundingClientRect();
//   camera.rotation.y = - Math.PI/2 + Math.PI*(evt.clientX - rect.left)/WIDTH;
//   camera.rotation.x = Math.PI*(evt.clientY - rect.top)/HEIGHT - Math.PI/2;
// });
canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;

document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

// function onlyMoveWhenFocused() {
//   // let cCanvas = document.querySelector('canvas');
//   if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
//     console.log('The pointer lock status is now locked');
    
//   } else {
//     console.log('The pointer lock status is now unlocked');  
//     document.removeEventListener("mousemove", handleMouse, false);
//   }
// }

canvas.addEventListener("mousemove", (e) => {
  camera.rotation.y += -e.movementX/200;
  camera.rotation.x += e.movementY/200;
  console.log(`mouseX -> ${e.movementX}, mouseY -> ${e.movementY}`);
}, false);


canvas.onclick = function() {
  canvas.requestPointerLock();
};





canvas.id = "threejscanvas";
document.body.appendChild( canvas );

canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
canvas.requestPointerLock();

// canvas.style.cursor = "none";
var scene = new THREE.Scene();

let light = new THREE.AmbientLight(0xffffff);
scene.add(light);

let players = {};
let asteroids = [];
let booleits = [];

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

  for (let i in game_environment.environment.asteroids){
    let asteroid = game_environment.environment.asteroids[i];
    let geometry = new THREE.SphereGeometry(asteroid.r);
    let material = new THREE.MeshPhongMaterial({color: "#ffffff"});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = asteroid.pos.x;
    cube.position.y = asteroid.pos.y;
    cube.position.z = asteroid.pos.z;
    scene.add(cube);
    asteroids.push(cube);
  }

  for (let i in game_environment.environment.booleits){
    let booleit = game_environment.environment.booleits[i];
    let geometry = new THREE.SphereGeometry(RADIUS.booleits);
    let material = new THREE.MeshPhongMaterial({color: "#ff0000"});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = booleit.pos.x;
    cube.position.y = booleit.pos.y;
    cube.position.z = booleit.pos.z;
    scene.add(cube);
    booleits.push(cube);
  }

  update_HUD();
}


let ptLights = [];
let ptLightBlobs = [];
let ptLightVels = [];
let ptLightColors = ["#ffff00", "#0000ff", "#00ff00", "#ff0000", "#00FFFF", "#ffffff"];

for(let i in ptLightColors){
  ptLights.push( new THREE.PointLight( ptLightColors[i], 1, 100, 2) );
  scene.add(ptLights[i]);

  ptLightVels.push(new THREE.Vector3(Math.random(), Math.random(), Math.random()));
  ptLightVels[i].normalize();
  ptLightVels[i].multiplyScalar(lightSpeed);

  const geometry = new THREE.SphereGeometry(0.25, 32, 32);
  const material = new THREE.MeshPhongMaterial({color: ptLightColors[i], emissive: ptLightColors[i]});
  ptLightBlobs.push(new THREE.Mesh(geometry, material));
  scene.add(ptLightBlobs[i]);

  ptLights[i].position.set(Math.random()*dim, Math.random()*dim, Math.random()*dim);
  ptLightBlobs[i].position.copy(ptLights[i].position);
}

function alekRandomWalk(i){
  if (Math.random() < 0.003){
    ptLightVels[i].add(new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5));
    ptLightVels[i].normalize();
    ptLightVels[i].multiplyScalar(lightSpeed);
  }
  ptLights[i].position.add(ptLightVels[i]);

  if(ptLights[i].position.x < 0 || ptLights[i].position.x > dim ||
    ptLights[i].position.y < 0 || ptLights[i].position.y > dim ||
    ptLights[i].position.z < 0 || ptLights[i].position.z > dim){

    ptLightVels[i].subVectors(center, ptLights[i].position);
    ptLightVels[i].normalize();
    ptLightVels[i].multiplyScalar(lightSpeed);
    ptLights[i].position.add(ptLightVels[i]);
  }

  ptLightBlobs[i].position.copy(ptLights[i].position);
}

function update_HUD(){
  for(let i=0; i < game_environment.redTeam.teamlives; i++){
      $("body").append(`<img style='position:absolute; top:1vh; left:${3.5*i}vw; width:3vw' src='assets/redLife.png'></img>`);
  }
  for(let i=0; i < game_environment.bluTeam.teamlives; i++){
      $("body").append(`<img style='position:absolute; top:1vh; right:${3.5*i}vw; width:3vw' src='assets/bluLife.png'></img>`);
  }
  if(whoami == "redA" || whoami == "redB"){
    $("body").append(`<p style='position:absolute; top:3vh; left:0; color: white'>Booleits: ${game_environment[whoami].booleits}</p>`);
    $("body").append(`<p style='position:absolute; top:5vh; left:0; color: white'>${whoami}</p>`);
  }
  if(whoami == "bluB" || whoami == "bluA"){
    $("body").append(`<p style='position:absolute; top:3vh; right:0; color: white'>Booleits: ${whoami}</p>`);
    $("body").append(`<p style='position:absolute; top:5vh; right:0; color: white'>Booleits: ${whoami}</p>`);
  }
}

function animate() {
	requestAnimationFrame( animate );
  camera.position.x = game_environment[whoami].pos.x;
  camera.position.y = game_environment[whoami].pos.y;
  camera.position.z = game_environment[whoami].pos.z+10;

  for(let player in players){
    players[player].position.x = game_environment[player].pos.x;
    players[player].position.y = game_environment[player].pos.y;
    players[player].position.z = game_environment[player].pos.z;
  }

  for(let i in ptLights){
    alekRandomWalk(i);
  }

	renderer.render( scene, camera );
}

socket.on('update', (new_game_environment)=>{
  game_environment = new_game_environment;
  handleKeys();
  if(!gameenvLoaded){
    gameenvLoaded = true;
    initGameEnv();
    animate();

  }
});

