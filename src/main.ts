import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { PeerNetwork } from "./network/PeerNetwork";
import { Builder } from "./builder";
import { Course } from "./course";
import { Match } from "./match";
import { Tile } from "./tile";
import { Global } from "./global";
import { World } from "./physics/world";
import { degToRad, radToDeg } from "three/src/math/MathUtils.js";
import { StorageManager } from "./storageManager";
import { level1 } from "./course/courses";

// config scene
const network = new PeerNetwork();
(window as any).network = network;

const peerID = document.getElementById("PeerID")! as HTMLInputElement;
const connect = document.getElementById("Connect")! as HTMLButtonElement;
connect.onclick = () => network.joinRoom(peerID.value);

const course = level1();
const courses = [course];
const match = new Match(courses);
match.nextCourse();

const ball = Builder.ball();
ball.mesh.position.set(0, 1, 0);
match.scene.add(ball.mesh);
match.scene.add(ball.arrow);

const club = Builder.club(ball);
match.scene.add(club.arrow);

const colliderDebug = new THREE.Mesh(new THREE.SphereGeometry(0.01));
match.scene.add(colliderDebug);

match.renderer.domElement.addEventListener("mousemove", (e) => {
    club.calculateDirection(match.camera, e, match.renderer.domElement.getBoundingClientRect(), ball)
})

match.renderer.domElement.addEventListener("mousedown", (e) => {
    club.startShot();
})

match.renderer.domElement.addEventListener("mouseup", (e) => {
    club.freeShot();
})

const timer = new THREE.Timer();

let lastCollision = Date.now();
const collisionCheckInterval = 50;
const raycaster = new THREE.Raycaster();
raycaster.near = 0;
raycaster.far = 100;

const down = new THREE.Vector3(0, -1, 0);
const forward = new THREE.Vector3();
let isGrounded = false;

function animate() {
    requestAnimationFrame(animate);

    timer.update();
    const delta = timer.getDelta() * Global.timeScale;

    for (const monobehavior of Builder.monobehaviors) monobehavior.update(delta);

    const direction = new THREE.Vector3().subVectors(match.camera.position, ball.mesh.position).normalize();
    
    const distance = ball.mesh.position.distanceTo(match.camera.position);
    match.camera.position.copy(direction.multiplyScalar(distance).add(ball.mesh.position));
    match.orbitControls.target.copy(ball.mesh.position);
    match.orbitControls.update();

    match.renderer.render(match.scene, match.camera);

    if (!ball.rigidBody.isMoving() && isGrounded) {
        club.showArrow();
        // const tile = course.tryGetTile({x: 0, y: 0, z: rows - 2});
        // if (tile) {
        //     const box = new THREE.Box3(
        //         new THREE.Vector3(-(tile.width / 2), 0          , ((rows - 2) * tile.length) - (tile.length / 2)),
        //         new THREE.Vector3( (tile.width / 2), 10000000000, ((rows - 2) * tile.length) + (tile.length / 2)),
        //     )

        //     if (box.containsPoint(ball.mesh.position)) {
        //         tile.setColor(0x0000aa);
        //     } else {
        //         tile.setColor(0xaa0000);
        //     }
        // }
    } else {
        club.hideArrow();
    }
    
    if ((Date.now() - lastCollision) < collisionCheckInterval) return;

    // calculateWallCollision(delta);
    applyGravity(delta);
    calculateCollision(delta);
    ball.rigidBody.applyDrag(ball.rigidBody.getSpeed() * World.windDrag * delta);
}

animate();

function calculateWallCollision(delta: number) {
    const pos = ball.mesh.position;
    const radius = ball.radius;

    const normal = new THREE.Vector3();
    let collided = false;

    if (pos.x - radius < course.bounds.min.x) {
        pos.x = course.bounds.min.x + radius;
        normal.set(1, 0, 0);
        collided = true;
    }
    else if (pos.x + radius > course.bounds.max.x) {
        pos.x = course.bounds.max.x - radius;
        normal.set(-1, 0, 0);
        collided = true;
    }

    if (pos.z - radius < course.bounds.min.z) {
        pos.z = course.bounds.min.z + radius;
        normal.set(0, 0, 1);
        collided = true;
    }
    else if (pos.z + radius > course.bounds.max.z) {
        pos.z = course.bounds.max.z - radius;
        normal.set(0, 0, -1);
        collided = true;
    }

    if (collided) {
        ball.rigidBody.reflect(normal);
        lastCollision = Date.now();
    }
}

function applyGravity(delta: number) {
    raycaster.set(ball.mesh.position, down);
    raycaster.far = ball.radius;

    const intersections = raycaster.intersectObjects(course.tiles.values().toArray().map(t => t.mesh));
    const hit = intersections.find(i => i.object.uuid !== ball.mesh.uuid);

    const distance = World.gravity.length() + ball.radius;
    
    if (hit && hit.distance < ball.radius * 1.1) {
        isGrounded = true;
    } else {
        isGrounded = false;
    }

    if (isGrounded && !ball.rigidBody.isMoving()) {
        ball.rigidBody.stop();
    }

    if (!hit || hit.distance > ball.radius * 1.1) {
        ball.rigidBody.applyForce(World.gravity.clone().multiplyScalar(delta));
    }
}

function calculateCollision(delta: number) {
    if (!ball.rigidBody.isMoving()) return;

    if (isGrounded) {
        raycaster.set(ball.mesh.position, new THREE.Vector3(0, -1, 0));
        const intersections = raycaster.intersectObjects(course.tiles.values().toArray().map(t => t.mesh));
        const hit2 = intersections.find(i => i.object.uuid !== ball.mesh.uuid);
        if (!hit2) return;

        const tile2 = course.tiles.values().toArray().find(tile => tile.mesh.uuid === hit2.object.uuid);
        if (!tile2) return;

        ball.rigidBody.applyDrag(tile2.friction * delta);
    }
    
    forward.copy(ball.rigidBody.getDirection());
    raycaster.set(ball.mesh.position, forward);
    const intersections = raycaster.intersectObjects(course.tiles.values().toArray().map(t => t.mesh));

    if (intersections.length === 0) return;

    const movement = ball.rigidBody.getVelocity().multiplyScalar(delta);
    const distance = movement.length();

    const hit = intersections.find(i => i.object.uuid !== ball.mesh.uuid);
    if (!hit) return;

    colliderDebug.position.copy(hit.point)

    if (isColliding(forward, hit, ball.radius)) {
        const tile = course.tiles.values().toArray().find(tile => tile.mesh.uuid === hit.object.uuid);
        if (!tile) return;

        const normal = hit.face!.normal.clone();
        normal.transformDirection(hit.object.matrixWorld).normalize();

        const dot = forward.dot(normal);
        const impactStrength = Math.abs(dot) * tile.absorption;
        ball.rigidBody.reflect(normal, impactStrength);
    }
}

function isColliding(direction: THREE.Vector3, hit: THREE.Intersection, radius: number, threshold: number = 1) {
    const inverseNormal = hit.face!.normal.clone().multiplyScalar(-1);
    const angle = radToDeg(inverseNormal.angleTo(direction));

    const opositeAngle = 90 - angle;
    const cossine = Math.cos(degToRad(opositeAngle));
    const hypotenuse = hit.distance;

    const adjacentSide = cossine * hypotenuse;
    const distance = Math.abs(adjacentSide - radius);

    const isColliding = distance < threshold;
    return isColliding;
}
