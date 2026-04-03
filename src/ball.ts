import * as THREE from "three";
import { Monobehavior } from "./monobehavior";
import { RigidBody } from "./physics/rigidBody";

export class Ball extends Monobehavior {
    public readonly mesh: THREE.Mesh;
    public readonly collider: THREE.Sphere;
    public readonly rigidBody: RigidBody;

    //#region [gizmos]
    public readonly arrow: THREE.ArrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 0.5, new THREE.Color(255, 0, 255));
    public readonly colliderDebug: THREE.Mesh = new THREE.Mesh(new THREE.SphereGeometry(0.01, 16, 16));
    //#endregion

    
    public readonly radius: number;
    public isCollidingGround: boolean = false;
    public isPenetrating: boolean = false;
    public lastGroundPosition: THREE.Vector3 = new THREE.Vector3();
    public isLoaded: boolean = false;

    private readonly stopThreshold = 0.01;

    public constructor(mesh: THREE.Mesh, radius: number = 1) {
        super();
        
        this.mesh = mesh;
        this.radius = radius;

        this.collider = new THREE.Sphere(mesh.position, radius);
        this.rigidBody = new RigidBody(mesh.position, mesh.quaternion);
    }

    public update(delta: number): void {
        this.mesh.position.copy(this.rigidBody.position);
        this.mesh.quaternion.copy(this.rigidBody.quaternion);
        
        this.arrow.position.copy(this.mesh.position);
        this.arrow.setDirection(this.rigidBody.getDirection());
        this.arrow.visible = false;
    }
}