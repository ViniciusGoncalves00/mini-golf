import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Ball } from "../ball";
import { Monobehavior } from "../monobehavior";

export class CameraWrapper extends Monobehavior {
    public distance: number = 2;
    public camera: THREE.PerspectiveCamera;
    public orbitControls: OrbitControls;

    private readonly ball: Ball;

    public constructor(canvas: HTMLElement, ball: Ball) {
        super();
        
        this.ball = ball;

        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(1, 1, -2);
        
        this.orbitControls = new OrbitControls(this.camera, canvas);
        this.orbitControls.enablePan = false;
    }

    public update(delta: number): void {
        const camera = this.camera;
        const ball = this.ball;

        const direction = new THREE.Vector3().subVectors(camera.position, ball.mesh.position).normalize();
        const position = new THREE.Vector3().copy(direction).multiplyScalar(this.distance).add(ball.mesh.position);

        camera.position.copy(position);

        this.orbitControls.target.copy(ball.mesh.position);
        this.orbitControls.update();
    }
}