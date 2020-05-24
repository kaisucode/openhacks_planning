var MASS = {
  "player": 1,
  "booleits": 0.1,
  "amoboxes": 1,
  "extralife": 1
};

var RADIUS = {
  "player": 0.5,
  "booleits": 5,
  "extralife": 1,
  "amoboxes": 1
};

var PLAYERS = ["redA", "redB", "bluA", "bluB"];

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
function scaleVec(v, k){
  v.x *= k;
  v.y *= k;
  v.z *= k;
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

function vecToVector3(v){
  return new Vector3(v.x, v.y, v.z);
}

function Vector3ToVec(v){
  return {"x": v.x, "y": v.y, "z": v.z};
}

function carToSph(v, asteroid, player){
  let xRel = player.pos.x-asteroid.pos.x;
  let yRel = player.pos.y-asteroid.pos.y;
  let zRel = player.pos.z-asteroid.pos.z;

  return {"theta": Math.atan(Math.sqrt(sq(x)+sq(y))/z), "phi": Math.atan(yRel/xRel)};
}

function sphToCar(v, asteroid, player){
  let r = asteroid.r + RADIUS.player; 
  let x = r*Math.sin(v.theta)*Math.cos(v.phi);
  let y = r*Math.sin(v.theta)*Math.sin(v.phi);
  let z = r*Math.cos(v.theta);

  let orient = vecDiff(player.position, asteroid.position);

  return vec(x+asteroid.pos.x, y+asteroid.pos.y, z+asteroid.pos.z);
}

