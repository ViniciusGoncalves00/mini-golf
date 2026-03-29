import * as THREE from "three";
import { Monobehavior } from "./monobehavior";
import { RigidBody } from "./physics/rigidBody";

export class Ball extends Monobehavior {
    public readonly mesh: THREE.Mesh;
    public readonly arrow: THREE.ArrowHelper;
    public readonly collider: THREE.Sphere;
    public readonly rigidBody: RigidBody;

    public readonly radius: number;
    public readonly isLoaded: boolean = false;

    private readonly stopThreshold = 0.01;

    public constructor(mesh: THREE.Mesh, radius: number = 1) {
        super();
        
        this.mesh = mesh;
        this.radius = radius;

        this.collider = new THREE.Sphere(mesh.position, radius);
        this.arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 0.5, new THREE.Color(255, 0, 255));
        this.rigidBody = new RigidBody(mesh.position, mesh.quaternion);
    }

    public update(delta: number): void {
        this.rigidBody.getSpeed() < this.stopThreshold ? this.rigidBody.stop() : this.rigidBody.update(delta);
        this.arrow.position.copy(this.mesh.position);
        this.arrow.setDirection(this.rigidBody.getDirection());
    }
}