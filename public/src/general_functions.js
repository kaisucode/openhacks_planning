// note: you can't have const or let in here, because eval is dumb


var grid_size = 1000; // [-1000, 1000]^3 is the world
var GRAVITY = 3;
var JUMP_DIST = 120;
var JUMP_VEL = 30;

var MASS = {
  "player": 1,
  "booleits": 0.1,
  "amoboxes": 1,
  "extralife": 1
};

var RADIUS = {
  "player": 0.5,
  "booleits": 20,
  "extralife": 1,
  "amoboxes": 1
};

var PLAYERS = ["redA", "redB", "bluA", "bluB"];

function copyBtoA(a, b){
  a.x = b.x;
  a.y = b.y;
  a.z = b.z;
}

function vec(x,y,z){
  return {"x": x, "y": y, "z": z};
}
function randvec(s){
  s = s || 1;
  return vec(s*2*(Math.random()-0.5), s*2*(Math.random()-0.5), s*2*(Math.random()-0.5));
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
function scaleVec(v, k){
  v.x *= k;
  v.y *= k;
  v.z *= k;
}

function vecMult(v, k){
  return {"x": v.x*k, "y": v.y*k, "z": v.z*k};
}
function normalizeVec(v){
  return vecMult(v, 1/vecMag(v));
}
function vecDiffMagSquared(a, b){
  return vecMagSquared(vecDiff(a,b));
}
function vecToString(v){
  return `${v.x.toFixed(3)}, ${v.y.toFixed(3)}, ${v.z.toFixed(3)}`;
}

function vecToVector3(v){
  return new Vector3(v.x, v.y, v.z);
}

function Vector3ToVec(v){
  return {"x": v.x, "y": v.y, "z": v.z};
}

function carToSph(asteroid, player){
  let xRel = player.pos.x-asteroid.pos.x;
  let yRel = player.pos.y-asteroid.pos.y;
  let zRel = player.pos.z-asteroid.pos.z;

  return {"theta": Math.atan(Math.sqrt(sq(xRel)+sq(yRel))/zRel), "phi": Math.atan(yRel/xRel)};
}

function sphToCar(v, asteroid, player){
  let r = asteroid.r + RADIUS.player; 
  let x = r*Math.sin(v.theta)*Math.cos(v.phi);
  let y = r*Math.sin(v.theta)*Math.sin(v.phi);
  let z = r*Math.cos(v.theta);

  let orient = vecDiff(player.pos, asteroid.pos);

  return vec(x+asteroid.pos.x, y+asteroid.pos.y, z+asteroid.pos.z);
}

function sphToCarForCamera(v, asteroid, player){
  let r = asteroid.r + RADIUS.player + 40; 
  let x = r*Math.sin(v.theta)*Math.cos(v.phi);
  let y = r*Math.sin(v.theta)*Math.sin(v.phi);
  let z = r*Math.cos(v.theta);

  // let orient = vecDiff(player.pos, asteroid.pos);

  return vec(-x+asteroid.pos.x, -y+asteroid.pos.y, -z+asteroid.pos.z);
}

