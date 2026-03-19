import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { PeerNetwork } from "./network/PeerNetwork";
import { Builder } from "./builder";
import { Course } from "./course";
import { Match } from "./match";
import { Tile } from "./tile";

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

const items: Tile[] = []
const rows = 9;
const colums = 3;

for (let colum = -Math.round((colums - 1) / 2); colum < Math.round(colums / 2); colum++) {
    for (let row = 0; row < rows; row++) {
        const color = (colum + row) % 2 == 0 ?0x00aa00 : 0x00cc00;
        items.push(Builder.tile({x: colum, y: 0, z: row}, color));
    }
}

const course = new Course(items);

const courses = [course];
const match = new Match(courses);
match.nextCourse();

const ball = Builder.ball();
ball.mesh.position.set(0, 1, 0);
match.scene.add(ball.mesh);

const club = Builder.club(ball);
match.scene.add(club.arrow);

// renderer.domElement.addEventListener("mousemove", (e) => {
//     club.calculateDirection(camera, e, renderer.domElement.getBoundingClientRect(), ball)
// })

// renderer.domElement.addEventListener("mousedown", (e) => {
//     club.startShot();
// })

// renderer.domElement.addEventListener("mouseup", (e) => {
//     club.freeShot();
// })

const timer = new THREE.Timer();

let lastCollision = Date.now();
const collisionCheckInterval = 100;
function animate() {
    requestAnimationFrame(animate);

    timer.update();
    const delta = timer.getDelta()

    for (const monobehavior of Builder.monobehaviors) monobehavior.update(delta);

    const direction = new THREE.Vector3().subVectors(match.camera.position, ball.mesh.position).normalize();
    
    const distance = 10;
    match.camera.position.copy(direction.multiplyScalar(distance).add(ball.mesh.position));
    match.orbitControls.target.copy(ball.mesh.position);
    match.orbitControls.update();

    match.renderer.render(match.scene, match.camera);

    if (!ball.isMoving()) {
        club.showArrow();
        const tile = course.tryGetTile({x: 0, y: 0, z: rows - 2});
        if (tile) {
            const box = new THREE.Box3(
                new THREE.Vector3(-(tile.width / 2), 0          , ((rows - 2) * tile.depth) - (tile.depth / 2)),
                new THREE.Vector3( (tile.width / 2), 10000000000, ((rows - 2) * tile.depth) + (tile.depth / 2)),
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
    
    if ((Date.now() - lastCollision) < collisionCheckInterval) return;
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

        ball.velocity.reflect(normal);

        lastCollision = Date.now();
    }
}

animate();