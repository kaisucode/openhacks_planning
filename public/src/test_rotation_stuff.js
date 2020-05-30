
const S = new THREE.Matrix3(
  0,0,-1,
  -1,0,0
  0,-1,0
);
const S_inverse = new THREE.Matrix3(
  0,-1,0,
  0,0,-1,
  -1,0,0
);

function yaw(psi){
  const M = new THREE.Matrix3(
    Math.cos(psi), Math.sin(psi), 0, 
    -Math.sin(psi), Math.cos(psi), 0, 
    0, 0, 1)
  return S.multiply(M.multiply(S_inverse));
}

function pitch(theta){
  const M = new THREE.Matrix3(
    Math.cos(theta), 0, -Math.sin(theta),
    0,1,0
    Math.sin(theta), 0, Math.cos(theta));
  return S.multiply(M.multiply(S_inverse));
}

function roll(phi){
  const M = new THREE.Matrix3(
    1,0,0
    0,Math.cos(phi), Math.sin(phi),
    0, -Math.sin(phi), Math.cos(phi)
  );
  return S.multiply(M.multiply(S_inverse));
}

function rotate_local(psi, theta, phi){
  return yaw(psi).multiply(pitch(theta).multiply(roll(phi)));
}

let v1 = camera.getWorldDirection();
let v2 = camera.getUpDirection(); // pseudocode
let v3 = cross(v1, v2); // pseudocode

