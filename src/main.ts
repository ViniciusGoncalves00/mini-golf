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
import { degToRad } from "three/src/math/MathUtils.js";

// config scene
const network = new PeerNetwork();
(window as any).network = network;

const tiles: Tile[] = []
const rows = 9;
const colums = 3;

for (let colum = -Math.round((colums - 1) / 2); colum < Math.round(colums / 2); colum++) {
    for (let row = 0; row < rows; row++) {
        const color = (colum + row) % 2 == 0 ? 0x00aa00 : 0x00cc00;
        const y = row == Math.round(rows / 2) ? -1 : 0;
        const tile = Builder.planeTile({x: colum, y: y, z: row}, color);
        if (row == Math.round(rows / 2)) tile.mesh.rotateX(degToRad(-30))
        tiles.push(tile);
    }
}

for (let colum = -Math.round((colums - 1) / 2); colum < Math.round(colums / 2); colum++) {
    for (let row = 0; row < rows; row++) {
        const color = (colum + row) % 2 == 0 ? 0x00aa00 : 0x00cc00;
        const y = row == Math.round(rows / 2) ? -21 : -20;
        const tile = Builder.planeTile({x: colum, y: y, z: row}, color);
        if (row == Math.round(rows / 2)) tile.mesh.rotateX(degToRad(-30))
        tiles.push(tile);
    }
}

for (let colum = -Math.round((colums - 1) / 2); colum < Math.round(colums / 2); colum++) {
    for (let row = 0; row < rows; row++) {
        const color = (colum + row) % 2 == 0 ? 0x00aa00 : 0x00cc00;
        tiles.push(Builder.planeTile({x: colum, y: -40, z: row}, color));
    }
}

const course = new Course(tiles);

const courses = [course];
const match = new Match(courses);
match.nextCourse();

const ball = Builder.ball();
ball.mesh.position.set(0, 10, 0);
match.scene.add(ball.mesh);
match.scene.add(ball.arrow);

const club = Builder.club(ball);
match.scene.add(club.arrow);

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
const collisionCheckInterval = 10;
const raycaster = new THREE.Raycaster();
raycaster.near = 0;
raycaster.far = 100;

const down = new THREE.Vector3(0, -1, 0);
const forward = new THREE.Vector3();

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

    if (!ball.rigidBody.isMoving()) {
        club.showArrow();
        const tile = course.tryGetTile({x: 0, y: 0, z: rows - 2});
        if (tile) {
            const box = new THREE.Box3(
                new THREE.Vector3(-(tile.width / 2), 0          , ((rows - 2) * tile.length) - (tile.length / 2)),
                new THREE.Vector3( (tile.width / 2), 10000000000, ((rows - 2) * tile.length) + (tile.length / 2)),
            )

            if (box.containsPoint(ball.mesh.position)) {
                tile.setColor(0x0000aa);
            } else {
                tile.setColor(0xaa0000);
            }
        }
    } else {
        club.hideArrow();
    }
    
    // if ((Date.now() - lastCollision) < collisionCheckInterval) return;

    calculateWallCollision(delta);
    // calculateGravity(delta);
    // calculateColliision(delta);
    physicsStep(delta);
    // ball.rigidBody.applyDrag(World.windDrag * delta);
}

animate();

function calculateWallCollision(delta: number) {
    if (!course.bounds.containsPoint(ball.mesh.position)) {
        const normal = new THREE.Vector3();

        if (ball.mesh.position.x < course.bounds.min.x) {
            normal.set(1, 0, 0);
        }
        else if (ball.mesh.position.x > course.bounds.max.x) {
            normal.set(-1, 0, 0);
        }
        else if (ball.mesh.position.z < course.bounds.min.z) {
            normal.set(0, 0, 1);
        }
        else if (ball.mesh.position.z > course.bounds.max.z) {
            normal.set(0, 0, -1);
        }

        ball.rigidBody.reflect(normal);

        lastCollision = Date.now();
    }
}

function calculateGravity(delta: number) {
    raycaster.set(ball.mesh.position, down);
    const intersections = raycaster.intersectObjects(tiles.map(tile => tile.mesh));

    const hit = intersections[0].object.uuid === ball.mesh.uuid ? intersections[1] : intersections[0];
    
    if (!ball.rigidBody.isMoving() && hit?.distance < ball.radius + 0.1) {
        ball.rigidBody.stop();
        return;
    }

    ball.rigidBody.applyForce(World.gravity.clone().multiplyScalar(delta));
}

function calculateColliision(delta: number) {
    if (!ball.rigidBody.isMoving()) return;
    
    forward.copy(ball.rigidBody.getDirection());
    raycaster.set(ball.mesh.position, forward);
    const intersections = raycaster.intersectObjects(tiles.map(tile => tile.mesh));
    
    if (intersections.length === 0) return;

    const hit = intersections[0].object.uuid === ball.mesh.uuid ? intersections[1] : intersections[0];

    if (hit.distance < ball.radius + 0.01) {
        const tile = tiles.find(tile => tile.mesh.uuid === hit.object.uuid);
        if (!tile) return;

        const normal = hit.face!.normal.clone();
        normal.transformDirection(hit.object.matrixWorld).normalize();

        const dot = forward.dot(normal);

        if (Math.abs(dot) < 0.01) {
            ball.rigidBody.applyDrag(tile.friction);
        } 
        else if (dot < 0) {
            ball.rigidBody.reflect(normal, 1 - tile.absorption);
        }
    }
}

function physicsStep(delta: number) {
    const velocity = ball.rigidBody.getVelocity();

    // 🔹 1. aplicar gravidade
    ball.rigidBody.applyForce(World.gravity.clone().multiplyScalar(delta));

    const newVelocity = ball.rigidBody.getVelocity();

    // 🔹 2. prever movimento
    const movement = newVelocity.clone().multiplyScalar(delta);
    const distance = movement.length();

    if (distance === 0) return;

    const direction = movement.clone().normalize();

    // 🔹 3. raycast (sweep simplificado)
    raycaster.set(ball.mesh.position, direction);
    raycaster.far = distance + ball.radius;

    const intersections = raycaster.intersectObjects(tiles.map(t => t.mesh));
    const hit = intersections.find(i => i.object.uuid !== ball.mesh.uuid);

    if (!hit) {
        // ✅ sem colisão → move normalmente
        ball.mesh.position.add(movement);
        return;
    }

    // 🔹 4. colisão detectada

    const tile = tiles.find(t => t.mesh.uuid === hit.object.uuid);
    if (!tile) {
        ball.mesh.position.add(movement);
        return;
    }

    const normal = hit.face!.normal.clone()
        .transformDirection(hit.object.matrixWorld)
        .normalize();

    // 🔥 refletir velocidade
    const velocityBefore = newVelocity.clone();

    let reflected = velocityBefore.reflect(normal);

    // 🔹 absorção (perda de energia)
    reflected.multiplyScalar(1 - tile.absorption);

    // 🔹 atrito (quando quase paralelo)
    const dot = reflected.dot(normal);
    if (Math.abs(dot) < 0.01) {
        reflected.multiplyScalar(1 - tile.friction);
    }

    ball.rigidBody.stop().applyForce(reflected);

    // 🔥 posição corrigida (não entra na malha)
    // const correctedPosition = hit.point.clone()
    //     .addScaledVector(normal, ball.radius);

    // ball.mesh.position.copy(correctedPosition);
}