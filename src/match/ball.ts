import * as THREE from "three";
import { Monobehavior } from "../monobehavior";
import { RigidBody } from "../physics/rigidBody";

export class Ball extends Monobehavior {
    public readonly mesh: THREE.Mesh;
    public readonly collider: THREE.Sphere;
    public readonly rigidBody: RigidBody;

    //#region [gizmos]
    public readonly arrow: THREE.ArrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 0.5, new THREE.Color(255, 0, 255));
    public readonly safePositionDebug: THREE.Mesh = new THREE.Mesh(new THREE.SphereGeometry(0.01, 16, 16), new THREE.MeshBasicMaterial({color: 0x00ff00}));
    public readonly colliderDebug: THREE.Mesh = new THREE.Mesh(new THREE.SphereGeometry(0.005, 16, 16), new THREE.MeshBasicMaterial({color: 0xffffff}));
    //#endregion

    //#region [callbacks]
    public readonly onStopMoving: (() => void)[] = [];
    //#region
     
    //#region
    public lastCollisionPosition: THREE.Vector3 = new THREE.Vector3();
    public lastGroundPosition: THREE.Vector3 = new THREE.Vector3();
    public lastSafePosition: THREE.Vector3 = new THREE.Vector3();

    public readonly radius: number;
    public readonly diameter: number;

    public isCollidingGround: boolean = false;
    public isPenetrating: boolean = false;
    public isLoaded: boolean = false;
    //#endregion

    private readonly stopThreshold = 0.01;

    public constructor(mesh: THREE.Mesh, radius: number) {
        super();
        
        this.mesh = mesh;
        this.radius = radius;
        this.diameter = radius * 2;

        this.collider = new THREE.Sphere(mesh.position, radius);
        this.rigidBody = new RigidBody(mesh.position, mesh.quaternion);

        this.safePositionDebug.visible = false;
    }

    public update(delta: number): void {
        this.mesh.position.copy(this.rigidBody.position);
        this.mesh.quaternion.copy(this.rigidBody.quaternion);
        
        this.arrow.position.copy(this.mesh.position);
        this.arrow.setDirection(this.rigidBody.getDirection());
        this.arrow.visible = false;

        this.safePositionDebug.position.copy(this.lastSafePosition);
        this.colliderDebug.position.copy(this.lastCollisionPosition);
    }
}