import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Ball } from "../match/ball";
import { Monobehavior } from "../monobehavior";
import { RigidBody } from "../physics/rigidBody";
import { CameraType } from "../common/enums";

export class CameraWrapper extends Monobehavior {
    public distance: number = 2;
    public camera: THREE.PerspectiveCamera;
    public orbitControls: OrbitControls;

    public controlType: CameraType = CameraType.FREE;
    private target: RigidBody | null = null;

    public constructor(canvas: HTMLElement) {
        super();
        
        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(1, 1, -2);
        
        this.orbitControls = new OrbitControls(this.camera, canvas);
    }

    public update(delta: number): void {
        const camera = this.camera;

        if (this.controlType === CameraType.TARGET && this.target) {
            const target = this.target;

            const direction = new THREE.Vector3().subVectors(camera.position, target.mesh.position).normalize();
            const position = new THREE.Vector3().copy(direction).multiplyScalar(this.distance).add(target.mesh.position);

            camera.position.copy(position);
            this.orbitControls.target.copy(target.mesh.position);
        }

        this.orbitControls.update();
    }

    public setTargetMode(body: RigidBody): void {
        this.controlType = CameraType.TARGET;
        this.target = body;

        this.orbitControls.enablePan = false;
    }

    public setFreeMode(): void {
        this.controlType = CameraType.FREE;
        this.target = null;

        this.orbitControls.enablePan = true;
    }
}