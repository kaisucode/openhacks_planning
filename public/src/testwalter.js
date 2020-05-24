const speed = 0.4;
const lightSpeed = 0.03;
const dim = 100;
const center = new THREE.Vector3(dim/2,dim/2,dim/2);
let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
const PLAYER_R = 2;
const ASTEROID_R = 10;

var camera = new THREE.PerspectiveCamera( 75, WIDTH / HEIGHT, 1, 1000 );
window.addEventListener('resize', function() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
});

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

let player, asteroid;

(()=>{
let geometry = new THREE.BoxGeometry(PLAYER_R*2, PLAYER_R*2, PLAYER_R*2);
let material = new THREE.MeshPhongMaterial({color: "#44aa88"});
const cube = new THREE.Mesh(geometry, material);
cube.rotation.x = Math.random()*Math.PI*2;
cube.rotation.y = Math.random()*Math.PI*2;
cube.rotation.z = Math.random()*Math.PI*2;
cube.position.x = 0;
cube.position.y = 0;
cube.position.z = 10;
scene.add(cube);
player = cube;
})();

(()=>{
let geometry = new THREE.SphereGeometry(ASTEROID_R);
let material = new THREE.MeshPhongMaterial({color: "#ffffff"});
const sphere = new THREE.Mesh(geometry, material);
sphere.position.x = 0;
sphere.position.y = 0;
sphere.position.z = 0;
scene.add(sphere);
asteroid = sphere;
})();

function animate() {
	requestAnimationFrame( animate );
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 30;

	renderer.render( scene, camera );
}
animate();

function vecDiff(a, b){
  return {"x": a.x-b.x, "y": a.y-b.y, "z": a.z-b.z};
}

function carToSph(v){
	let xRel = player.pos.x-asteroid.pos.x;
	let yRel = player.pos.y-asteroid.pos.y;
	let zRel = player.pos.z-asteroid.pos.z;

	return {"theta": Math.atan(Math.sqrt(sq(x)+sq(y))/z), "phi": Math.atan(yRel/xRel)};
}

function sphToCar(v){
	let r = ASTEROID_R + PLAYER_R; // FIXME
	let x = r*Math.sin(v.theta)*Math.cos(v.phi);
	let y = r*Math.sin(v.theta)*Math.sin(v.phi);
	let z = r*Math.cos(v.theta);
	let orient = vecDiff(player.position, asteroid.position);
  console.log(asteroid);
  console.log(player);
  console.log(v);

  player.position.x = x + asteroid.position.x;
  player.position.y = y + asteroid.position.y;
  player.position.z = z + asteroid.position.z;


  var parent = new THREE.Object3D();
  scene.add( parent );

  var stick = new THREE.Object3D();
  var point = new THREE.Vector3( x, y, z );
  stick.lookAt( point );
  parent.add( stick );

  //var geometry = new THREE.CubeGeometry( 25, 25, 25, 1, 1, 1 );
  scene.remove(player)
  let geometry = new THREE.BoxGeometry(PLAYER_R*2, PLAYER_R*2, PLAYER_R*2);
  let material = new THREE.MeshPhongMaterial({color: "#44aa88"});
  var mesh = new THREE.Mesh( geometry, material );
  mesh.position.set( 0, 0, r );
  stick.add( mesh );

}

function duck(a,b){
  return a+b;
}


// function sphToCar(v){
// 	let r = asteroid.r + RADIUS.player
// 	let x = r*Math.sin(v.theta)*Math.cos(v.phi)
// 	let y = r*Math.sin(v.theta)*Math.sin(v.phi)
// 	let z = r*Math.cos(v.theta)
// 	let orient = vecDiff(player.pos, asteroid.pos)
//
//   player.pos.x = x + asteroid.pos.x
//   player.pos.y = y + asteroid.pos.y
//   player.pos.z = z + asteroid.pos.z
// }
