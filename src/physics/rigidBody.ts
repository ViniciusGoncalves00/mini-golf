import * as THREE from "three";
import { Monobehavior } from "../monobehavior";
import { World } from "./world";

export class RigidBody extends Monobehavior {
    private readonly position: THREE.Vector3;
    private readonly quaternion: THREE.Quaternion;

    private readonly velocity: THREE.Vector3 = new THREE.Vector3();
    private readonly friction: number = 0.98;

    public constructor(position: THREE.Vector3, quaternion: THREE.Quaternion) {
        super();

        this.position = position;
        this.quaternion = quaternion;
    }

    public update(delta: number): void {
        this.applyGravity();
        this.applyWind();
        this.applyDrag();
        this.applyFriction();

        this.position.addScaledVector(this.velocity, delta);
    }

    public applyForce(force: THREE.Vector3): RigidBody {
        this.velocity.add(force);
        return this;
    }

    public stop(): RigidBody {
        this.velocity.set(0, 0, 0);
        return this;
    }

    public isMoving(): boolean {
        return this.velocity.length() > 0;
    }

    public getVelocity(): THREE.Vector3 {
        return this.velocity.clone();
    }

    public getDirection(): THREE.Vector3 {
        return this.velocity.clone().normalize();
    }

    public getSpeed(): number {
        return this.velocity.length();
    }

    private applyGravity() {
        this.velocity.add( World.gravity.clone());
    }

    private applyWind() {
        this.velocity.addScaledVector(World.windDirection, World.windSpeed);
    }

    private applyDrag() {
        const inverseDirection = this.velocity.clone().normalize().multiplyScalar(-1);
        this.velocity.addScaledVector(inverseDirection, World.windDrag);
    }

    private applyFriction() {
        this.velocity.multiplyScalar(this.friction);
    }
}