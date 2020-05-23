const speed = 0.4;
const lightSpeed = 0.03;
const dim = 100;
const center = new THREE.Vector3(dim/2,dim/2,dim/2);
let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

const KEY_CODES = {
  87: "w",
  65: "a",
  83: "s",
  68: "d",
  32: "space",
  81: "q",
  69: "e"
}
const PLAYERS = ["redA", "redB", "bluA", "bluB"];

var camera = new THREE.PerspectiveCamera( 75, WIDTH / HEIGHT, 1, 1000 );
window.addEventListener('resize', function() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
});

let game_environment = {
  "redTeam": {
    "teamlives": 5
  },
  "bluTeam": {
    "teamlives": 5
  },
  "redA": { "booleits": 10, "pos": {"x": 50, "y": 50, "z": 10}, "vel": {"x": 1, "y": 2, "z": 3} },
  "redB": { "booleits": 10, "pos": {"x": 50, "y": 50, "z": 10}, "vel": {"x": 1, "y": 2, "z": 3} },
  "bluA": { "booleits": 10, "pos": {"x": 50, "y": 50, "z": 10}, "vel": {"x": 1, "y": 2, "z": 3} },
  "bluB": { "booleits": 10, "pos": {"x": 50, "y": 50, "z": 10}, "vel": {"x": 1, "y": 2, "z": 3} },
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

let whoami = "redA";

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;
  if(KEY_CODES[keyCode] == "w"){
    console.log("w");
    game_environment[whoami].pos.x += 1;
  }
  if(KEY_CODES[keyCode] == "a"){
    console.log("a");
    game_environment[whoami].pos.y += 1;
  }
  if(KEY_CODES[keyCode] == "s"){
    console.log("s");
    game_environment[whoami].pos.x -= 1;
  }
  if(KEY_CODES[keyCode] == "d"){
    console.log("d");
    game_environment[whoami].pos.y -= 1;
  }
  if(KEY_CODES[keyCode] == "q"){
    camera.rotateZ(0.01);
  }
  if(KEY_CODES[keyCode] == "e"){
    camera.rotateZ(-0.01);
  }

  if(KEY_CODES[keyCode] == "space")
    console.log("space");
};

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor (0x000000, 1);
renderer.setSize(WIDTH, HEIGHT);
renderer.domElement.addEventListener("mousemove", evt=> {
  var rect = renderer.domElement.getBoundingClientRect();
  camera.rotation.y = Math.PI*(evt.clientX - rect.left)/WIDTH-Math.PI/2;
  camera.rotation.x = Math.PI*(evt.clientY - rect.top)/HEIGHT-Math.PI/2;
});
renderer.domElement.id = "threejscanvas";
document.body.appendChild( renderer.domElement );
renderer.domElement.style.cursor = "crosshair";

var scene = new THREE.Scene();

let light = new THREE.AmbientLight(0xffffff);
scene.add(light);

let players = {};
for (let player in PLAYERS){
  let geometry = new THREE.BoxGeometry(1,1,1);
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

let asteroids = [];
for (let i in game_environment.environment.asteroids){
  let asteroid = game_environment.environment.asteroids[i];
  let geometry = new THREE.SphereGeometry(Math.pow(asteroid.mass/2, 3));
  let material = new THREE.MeshPhongMaterial({color: "#ffffff"});
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = asteroid.pos.x;
  cube.position.y = asteroid.pos.y;
  cube.position.z = asteroid.pos.z;
  scene.add(cube);
  asteroids.push(cube);
}

let booleits = [];
for (let i in game_environment.environment.booleits){
  let projectile = game_environment.environment.booleits[i];
  let geometry = new THREE.SphereGeometry(0.5);
  let material = new THREE.MeshPhongMaterial({color: "#ff0000"});
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = projectile.pos.x;
  cube.position.y = projectile.pos.y;
  cube.position.z = projectile.pos.z;
  scene.add(cube);
  booleits.push(cube);
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
update_HUD();


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
animate();

