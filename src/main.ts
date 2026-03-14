import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { PeerNetwork } from "./network/PeerNetwork";
import { Tile } from "./tile";
import { Builder } from "./builder";
import { Board } from "./board";
import { Ball } from "./ball";
import { Club } from "./club";

// config scene
const network = new PeerNetwork();
(window as any).network = network;

const scene = new THREE.Scene();
scene.background = new THREE.Color(150, 150, 150);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(3, 3, 3);
camera.lookAt(0, 0, 0);

const canvas = document.getElementById("MyCanvas")!;
const renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

document.body.appendChild(renderer.domElement);

const timer = new THREE.Timer();

function animate() {
    requestAnimationFrame(animate);

    timer.update();
    const delta = timer.getDelta()
    for (const monobehavior of Builder.monobehaviors) monobehavior.update(delta);

    renderer.render(scene, camera);
}

animate();

const light = new THREE.DirectionalLight();
light.position.set(100, 100, 100);
light.lookAt(-1, -1, -1);
light.castShadow = true;
light.shadow!.mapSize.set(2048, 2048);
light.shadow!.bias = 0.0001;
light.shadow!.normalBias = 0.01;
scene.add(light)

const controls = new OrbitControls( camera, renderer.domElement );
// config scene

const board = new Board();
const items = [
    {coordinates: {x: 0, y: 0}, tile: Builder.tile(0x00aa00)},
    {coordinates: {x: 1, y: 0}, tile: Builder.tile(0x00bb00)},
    {coordinates: {x: 1, y: 1}, tile: Builder.tile(0x00cc00)},
    {coordinates: {x: 0, y: 1}, tile: Builder.tile(0x00dd00)},
]

items.forEach(item => {
    board.tryAddTile(item.coordinates, item.tile);
    item.tile.mesh.position.set(item.tile.width * item.coordinates.x, 0, item.tile.length * item.coordinates.y);
    scene.add(item.tile.mesh);
})

const ball = Builder.ball();
ball.mesh.position.set(0, 1, 0);
scene.add(ball.mesh);

const club = new Club();
scene.add(club.arrow);

renderer.domElement.addEventListener("mousemove", (e) => {
    club.calculateDirection(camera, e, renderer.domElement.getBoundingClientRect(), ball)
})

renderer.domElement.addEventListener("mousedown", (e) => {
    club.startShot(ball);
})

renderer.domElement.addEventListener("mouseup", (e) => {
    club.freeShot();
    
    // checkCondition(ball, area, radius);
})