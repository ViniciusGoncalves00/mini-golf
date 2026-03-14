// import "./style.css";
// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/Addons.js";
// import { PeerNetwork } from "./network/PeerNetwork";

// const radius = 2;
// const area = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, radius), new THREE.MeshPhongMaterial({ color: 0x0000f0 }));
// area.receiveShadow = true;
// area.castShadow = true;
// area.position.set(0, 0, 10)
// scene.add(area);

// const directionalArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 10, new THREE.Color(0, 0, 255));
// scene.add( directionalArrow );

// function checkCondition(ball: THREE.Mesh, area: THREE.Mesh, distance: number): void {
//     if (ball.position.distanceTo(area.position) < distance) console.log("Inside area");
// }

// network.onReceive.push((data) => {
//     if (data.type === "ball-position") {
//         ball.position.set(data.position[0], data.position[1], data.position[2]);
//         updateArrowPosition(directionalArrow, ball);
//     }
// })

// const peerID = document.getElementById("PeerID")! as HTMLInputElement;
// const connect = document.getElementById("Connect")! as HTMLButtonElement;
// connect.onclick = () => network.joinRoom(peerID.value);