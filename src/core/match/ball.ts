import * as THREE from "three";
import { Monobehavior } from "../monobehavior";
import { RigidBody } from "../physics/rigidBody";
import { BodyType } from "../common/enums";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { User } from "../user";

export class Ball extends Monobehavior {
    public readonly collider: THREE.Sphere;
    public readonly rigidBody: RigidBody;

    //#region [gizmos]
    private readonly arrow: THREE.ArrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 0.5, new THREE.Color(255, 0, 255));
    private readonly safePositionDebug: THREE.Mesh = new THREE.Mesh(new THREE.SphereGeometry(0.01, 16, 16), new THREE.MeshBasicMaterial({color: 0x00ff00}));
    private readonly colliderDebug: THREE.Mesh = new THREE.Mesh(new THREE.SphereGeometry(0.005, 16, 16), new THREE.MeshBasicMaterial({color: 0xffffff}));
    private readonly label: CSS2DObject = new CSS2DObject(document.createElement('div'));
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
        this.rigidBody.dragCoeficient = friction;
        this.rigidBody.absorption = absorption;
        this.rigidBody.size = radius;

        this.safePositionDebug.visible = false;

        const mapMarker = new THREE.Sprite(
            new THREE.SpriteMaterial({
                color: 0xffffff,
                depthTest: false,
                depthWrite: false,
            })
        );

        mapMarker.scale.set(100, 100, 1);
        mapMarker.position.y = 5;

        this.rigidBody.mesh.layers.set(0);
        mapMarker.layers.set(2);

        this.rigidBody.mesh.add(mapMarker);
    }

    public update(delta: number): void {
        const position = this.rigidBody.mesh.position;

        this.arrow.position.copy(position);
        this.arrow.setDirection(this.rigidBody.getDirection());
        this.arrow.visible = false;

        this.safePositionDebug.position.copy(this.lastSafePosition);
        this.colliderDebug.position.copy(this.lastCollisionPosition);
        this.label.position.copy(position);
        this.label.position.y += 0.05;
    }

    public add(player: User, scene: THREE.Scene, minimap: THREE.Scene): void {
        this.label.element.textContent = player.getName().get();
        this.label.element.style.color = 'white';

        minimap.add(this.label);
        scene.add(this.label);
        scene.add(this.arrow);
        scene.add(this.safePositionDebug);
        scene.add(this.colliderDebug);
    }

    public remove(scene: THREE.Scene, minimap: THREE.Scene): void {
        minimap.remove(this.label);
        scene.remove(this.label);
        scene.remove(this.arrow);
        scene.remove(this.safePositionDebug);
        scene.remove(this.colliderDebug);
    }
}