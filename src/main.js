const speed = 0.4;
const lightSpeed = 0.03;

const KEY_CODES = {
  87: "w",
  65: "a",
  83: "s",
  68: "d",
  32: "space"
}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;
  if(KEY_CODES[keyCode] == "w")
    console.log("w");
  if(KEY_CODES[keyCode] == "a")
    console.log("a");
  if(KEY_CODES[keyCode] == "s")
    console.log("s");
  if(KEY_CODES[keyCode] == "d")
    console.log("d");
  if(KEY_CODES[keyCode] == "space")
    console.log("space");
};

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor (0x000000, 1);
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();

let light = new THREE.AmbientLight(0x000000);
scene.add(light);

const spacing = 8;
const decay = 0.8;
const numBoxes = 6;
const dim = spacing*numBoxes;
const center = new THREE.Vector3(dim/2,dim/2,dim/2);

let cubes = [];

for (let x = 0; x < numBoxes; x++){
  for (let y = 0; y < numBoxes; y++){
    for (let z = 0; z < numBoxes; z++){
      let geometry;
      if (Math.random() < 0.5){
        geometry = new THREE.BoxGeometry(1,1,1);
      }
      else{
        geometry = new THREE.TorusGeometry( 1, 0.3, 8, 32 );
      }
      let material;
      if(Math.random() < 0.5){
        material = new THREE.MeshPhongMaterial({color: "#44aa88"});
      }
      else{
        material = new THREE.MeshPhongMaterial({color: "#ffffff"});
      }
      const cube = new THREE.Mesh(geometry, material);
      cube.rotation.x = Math.random()*Math.PI*2;
      cube.rotation.y = Math.random()*Math.PI*2;
      cube.rotation.z = Math.random()*Math.PI*2;
      cube.position.x = (x+(Math.random()-0.5)*2*decay)*spacing;
      cube.position.y = (y+(Math.random()-0.5)*2*decay)*spacing;
      cube.position.z = (z+(Math.random()-0.5)*2*decay)*spacing;
      scene.add(cube);
      cubes.push(cube);
    }
  }
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


var camera = new THREE.PerspectiveCamera( 75, WIDTH / HEIGHT, 0.1, 1000 ); window.addEventListener('resize', function() { WIDTH = window.innerWidth; HEIGHT = window.innerHeight;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
});


// this isn't cool and smooth YET ;0
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


let playerPos = new THREE.Vector3(dim/2,dim/2,dim/2);

function animate() {
	requestAnimationFrame( animate );
  camera.position.x = playerPos.x;
  camera.position.y = playerPos.y;
  camera.position.z = playerPos.z;

  for(let i in ptLights){
    alekRandomWalk(i);
  }

  for(let i in cubes){
    cubes[i].rotation.x += 0.05/13;
    cubes[i].rotation.y += 0.05/17;
    cubes[i].rotation.z += 0.05/19;
  }

	renderer.render( scene, camera );
}
animate();



