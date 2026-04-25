import * as THREE from "three";
import { Monobehavior } from "../monobehavior";
import { RigidBody } from "../physics/rigidBody";
import { BodyType } from "../common/enums";

export class Ball extends Monobehavior {
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
    //#endregion

    private readonly stopThreshold = 0.01;

    public constructor(mesh: THREE.Mesh, radius: number, friction: number, absorption: number) {
        super();
        
        this.radius = radius;
        this.diameter = radius * 2;

        this.collider = new THREE.Sphere(mesh.position, radius);
        this.rigidBody = new RigidBody(mesh, BodyType.DYNAMIC);
        this.rigidBody.friction = friction;
        this.rigidBody.absorption = absorption;
        this.rigidBody.size = radius;

        this.safePositionDebug.visible = false;
    }

    public update(delta: number): void {
        this.arrow.position.copy(this.rigidBody.mesh.position);
        this.arrow.setDirection(this.rigidBody.getDirection());
        this.arrow.visible = false;

        this.safePositionDebug.position.copy(this.lastSafePosition);
        this.colliderDebug.position.copy(this.lastCollisionPosition);
    }
}