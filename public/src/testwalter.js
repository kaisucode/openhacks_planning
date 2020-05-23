const speed = 0.4;
const lightSpeed = 0.03;
const dim = 100;
const center = new THREE.Vector3(dim/2,dim/2,dim/2);
let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

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
let geometry = new THREE.BoxGeometry(1,1,1);
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
let geometry = new THREE.SphereGeometry(10);
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

