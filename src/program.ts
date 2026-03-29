// import "./style.css";
// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/Addons.js";
// import { PeerNetwork } from "./network/PeerNetwork";
// import { Builder } from "./builder";
// import { Course } from "./course";
// import { Match } from "./match";
// import { Tile } from "./tile";
// import { Global } from "./global";
// import { World } from "./physics/world";
// import { degToRad, radToDeg } from "three/src/math/MathUtils.js";
// import { StorageManager } from "./storageManager";
// import { level1, level2 } from "./course/courses";

// // config scene
// export const main = () => {
// const network = new PeerNetwork();
// (window as any).network = network;

// const peerID = document.getElementById("PeerID")! as HTMLInputElement;
// const connect = document.getElementById("Connect")! as HTMLButtonElement;
// connect.onclick = () => network.joinRoom(peerID.value);

// // const colliderDebug = new THREE.Mesh(new THREE.SphereGeometry(0.01));
// // match.scene.add(colliderDebug);

// // let lastCollision = Date.now();
// // const collisionCheckInterval = 50;
// const raycaster = new THREE.Raycaster();
// raycaster.near = 0;
// raycaster.far = 100;

// const down = new THREE.Vector3(0, -1, 0);
// const forward = new THREE.Vector3();
// let isGrounded = false;

// // match.globalLight.target = ball.mesh;

// function calculateWallCollision(delta: number) {
//     const pos = ball.mesh.position;
//     const radius = ball.radius;

//     const normal = new THREE.Vector3();
//     let collided = false;

//     if (pos.x - radius < course.bounds.min.x) {
//         pos.x = course.bounds.min.x + radius;
//         normal.set(1, 0, 0);
//         collided = true;
//     }
//     else if (pos.x + radius > course.bounds.max.x) {
//         pos.x = course.bounds.max.x - radius;
//         normal.set(-1, 0, 0);
//         collided = true;
//     }

//     if (pos.z - radius < course.bounds.min.z) {
//         pos.z = course.bounds.min.z + radius;
//         normal.set(0, 0, 1);
//         collided = true;
//     }
//     else if (pos.z + radius > course.bounds.max.z) {
//         pos.z = course.bounds.max.z - radius;
//         normal.set(0, 0, -1);
//         collided = true;
//     }

//     if (collided) {
//         ball.rigidBody.reflect(normal);
//         lastCollision = Date.now();
//     }
// }

// function applyGravity(delta: number) {
//     raycaster.set(ball.mesh.position, down);
//     raycaster.far = ball.radius;

//     const intersections = raycaster.intersectObjects(course.tiles.values().toArray().map(t => t.mesh));
//     const hit = intersections.find(i => i.object.uuid !== ball.mesh.uuid);

//     const distance = World.gravity.length() + ball.radius;
    
//     if (hit && hit.distance < ball.radius * 1.1) {
//         isGrounded = true;
//     } else {
//         isGrounded = false;
//     }

//     if (isGrounded && ball.rigidBody.getSpeed() < 0.1) {
//         ball.rigidBody.stop();
//     }

//     if (!hit || hit.distance > ball.radius * 1.1) {
//         ball.rigidBody.applyForce(World.gravity.clone().multiplyScalar(delta));
//     }
// }

// function calculateCollision(delta: number) {
//     if (!ball.rigidBody.isMoving()) return;

//     if (isGrounded) {
//         raycaster.set(ball.mesh.position, new THREE.Vector3(0, -1, 0));
//         const intersections = raycaster.intersectObjects(course.tiles.values().toArray().map(t => t.mesh));
//         const hit2 = intersections.find(i => i.object.uuid !== ball.mesh.uuid);
//         if (!hit2) return;

//         const tile2 = course.tiles.values().toArray().find(tile => tile.mesh.uuid === hit2.object.uuid);
//         if (!tile2) return;

//         ball.rigidBody.applyDrag(tile2.friction * delta);
//     }
    
//     forward.copy(ball.rigidBody.getDirection());
//     raycaster.set(ball.mesh.position, forward);
//     const intersections = raycaster.intersectObjects(course.tiles.values().toArray().map(t => t.mesh));

//     if (intersections.length === 0) return;

//     const movement = ball.rigidBody.getVelocity().multiplyScalar(delta);
//     const distance = movement.length();

//     const hit = intersections.find(i => i.object.uuid !== ball.mesh.uuid);
//     if (!hit) return;

//     colliderDebug.position.copy(hit.point)

//     if (isColliding(forward, hit, ball.radius)) {
//         const tile = course.tiles.values().toArray().find(tile => tile.mesh.uuid === hit.object.uuid);
//         if (!tile) return;

//         const normal = hit.face!.normal.clone();
//         normal.transformDirection(hit.object.matrixWorld).normalize();

//         const dot = forward.dot(normal);
//         const impactStrength = Math.abs(dot) * tile.absorption;
//         ball.rigidBody.reflect(normal, impactStrength);
//     }
// }

// function isColliding(direction: THREE.Vector3, hit: THREE.Intersection, radius: number, threshold: number = 1) {
//     const inverseNormal = hit.face!.normal.clone().multiplyScalar(-1);
//     const angle = radToDeg(inverseNormal.angleTo(direction));

//     const opositeAngle = 90 - angle;
//     const cossine = Math.cos(degToRad(opositeAngle));
//     const hypotenuse = hit.distance;

//     const adjacentSide = cossine * hypotenuse;
//     const distance = Math.abs(adjacentSide - radius);

//     const isColliding = distance < threshold;
//     return isColliding;
// }
// }