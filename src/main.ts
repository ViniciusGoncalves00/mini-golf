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

// const scene = new THREE.Scene();
// scene.background = new THREE.Color(0.98, 0.98, 0.98);
// const camera = new THREE.PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   1000
// );

// camera.position.set(0, 15, -15);

// const canvas = document.getElementById("MyCanvas")!;
// const renderer = new THREE.WebGLRenderer({canvas: canvas});
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFShadowMap;

// document.body.appendChild(renderer.domElement);

// const light = new THREE.DirectionalLight();
// light.position.set(100, 100, 100);
// light.lookAt(-1, -1, -1);
// light.castShadow = true;
// light.shadow!.mapSize.set(2048, 2048);
// light.shadow!.bias = 0.0001;
// light.shadow!.normalBias = 0.01;
// scene.add(light)

// const controls = new OrbitControls( camera, renderer.domElement );
// controls.enablePan = false;
// config scene

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
    
    raycaster.set(ball.mesh.position, new THREE.Vector3(0, -1, 0));
    const intersections = raycaster.intersectObjects(tiles.map(tile => tile.mesh));
    
    if (intersections.length === 0) return;

    const hit = intersections[0]

    if (hit.distance > ball.radius) {
        ball.rigidBody.applyForce(World.gravity);
    } else {
        const tile = tiles.find(t => t.mesh === hit.object);
        if (!tile) return;

        const normal = hit.face!.normal.clone();
        normal.transformDirection(hit.object.matrixWorld).normalize();

        const direction = ball.rigidBody.getDirection();
        const dot = direction.dot(normal);

        if (ball.rigidBody.getSpeed() < 1) {
            ball.rigidBody.stop();
        } 
        else if (Math.abs(dot) < 0.01) {
            ball.rigidBody.applyDrag(tile.friction);
        } 
        else if (dot < 0) {
            ball.rigidBody.reflect(normal, 1 - tile.absorption);
        }
    }

    ball.rigidBody.applyDrag(World.windDrag);
}

animate();