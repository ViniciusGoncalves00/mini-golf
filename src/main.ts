import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { PeerNetwork } from "./network/PeerNetwork";

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

const canvas = document.getElementById("MyCanvas")!;
const renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

document.body.appendChild(renderer.domElement);

const ground = new THREE.Mesh(new THREE.BoxGeometry(100, 1, 100), new THREE.MeshPhongMaterial({ color: 0x00f000 }));
ground.receiveShadow = true;
scene.add(ground);

const radius = 2;
const area = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, radius), new THREE.MeshPhongMaterial({ color: 0x0000f0 }));
area.receiveShadow = true;
area.castShadow = true;
area.position.set(0, 0, 10)
scene.add(area);

const ball = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshPhongMaterial({ color: 0xf00000 }));
ball.position.set(0, 1.5, 0)
ball.receiveShadow = true;
ball.castShadow = true;
scene.add(ball);

camera.position.set(3, 3, 3);
camera.lookAt(0, 0, 0);

const light = new THREE.DirectionalLight();
light.position.set(10, 10, 10);
light.lookAt(-1, -1, -1);
light.castShadow = true;
light.shadow!.mapSize.set(2048, 2048);
light.shadow!.bias = 0.0001;
light.shadow!.normalBias = 0.01;

const controls = new OrbitControls( camera, renderer.domElement );

const directionalArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 10, new THREE.Color(0, 0, 255));
scene.add( directionalArrow );

scene.add(light)

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const direction = new THREE.Vector3();
const plane = new THREE.Plane();
let maxMagnitude = 100;
let strength = 100;
let lastPress = 0;

const velocity = new THREE.Vector3();
const timer = new THREE.Timer();

const friction = 0.98;
const stopThreshold = 0.01;

function animate() {
  requestAnimationFrame(animate);

    timer.update()
  const delta = timer.getDelta()

  updateBallMotion(delta);

  renderer.render(scene, camera);
}

animate();

renderer.domElement.addEventListener("mousemove", (e) => {
    updateArrowDirection(camera, directionalArrow, ball, direction, e);
})

renderer.domElement.addEventListener("mousedown", (e) => {
    lastPress = Date.now();
})

renderer.domElement.addEventListener("mouseup", (e) => {
    let magnitude = millisecondsToUnits(Date.now() - lastPress) * strength;
    magnitude = Math.min(magnitude, maxMagnitude);

    velocity.copy(direction).multiplyScalar(magnitude);
    console.log(velocity)
    
    checkCondition(ball, area, radius);
})

function updateArrowDirection(camera: THREE.PerspectiveCamera, arrow: THREE.ArrowHelper, ball: THREE.Mesh, direction: THREE.Vector3, event: MouseEvent): void {
    const rect = renderer.domElement.getBoundingClientRect();
    
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    plane.set(new THREE.Vector3(0, 1, 0), -ball.position.y);
    
    const point = new THREE.Vector3();
    
    if (raycaster.ray.intersectPlane(plane, point)) {
        const dir = new THREE.Vector3().subVectors(point, ball.position).normalize().multiplyScalar(-1);
    
        direction.set(...dir.toArray());
        arrow.setDirection(dir);
    }
}

function updateArrowPosition(arrow: THREE.ArrowHelper, ball: THREE.Mesh): void {
    arrow.position.copy(ball.position);
}

function checkCondition(ball: THREE.Mesh, area: THREE.Mesh, distance: number): void {
    if (ball.position.distanceTo(area.position) < distance) console.log("Inside area");
}

function millisecondsToUnits(ms: number): number {
    return ms / 1000;
}

function updateBallMotion(delta: number): void {
  if (velocity.lengthSq() === 0) return;

  ball.position.addScaledVector(velocity, delta);

  velocity.multiplyScalar(friction);

  if (velocity.length() < stopThreshold) {
    velocity.set(0, 0, 0);
  }

  network.send({
      type: "ball-position",
      position: [...ball.position.toArray()]
  })

  updateArrowPosition(directionalArrow, ball);
}

network.onReceive.push((data) => {
    if (data.type === "ball-position") {
        ball.position.set(data.position[0], data.position[1], data.position[2]);
        updateArrowPosition(directionalArrow, ball);
    }
})

const peerID = document.getElementById("PeerID")! as HTMLInputElement;
const connect = document.getElementById("Connect")! as HTMLButtonElement;
connect.onclick = () => network.joinRoom(peerID.value);