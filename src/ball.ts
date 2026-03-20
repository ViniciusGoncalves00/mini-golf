import * as THREE from "three";
import { Monobehavior } from "./monobehavior";
import { RigidBody } from "./physics/rigidBody";

export class Ball extends Monobehavior {
    public readonly mesh: THREE.Mesh;

    public readonly onStartMove: (() => void)[] = [];
    public readonly onStopMove: (() => void)[] = [];

    private readonly rigidBody: RigidBody;
    private readonly stopThreshold = 0.01;

    public constructor(mesh: THREE.Mesh) {
        super();
        
        this.mesh = mesh;
        this.rigidBody = new RigidBody(mesh.position, mesh.quaternion);
    }

    public update(delta: number): void {
        this.rigidBody.getSpeed() < this.stopThreshold ? this.stop() : this.rigidBody.update(delta);
    }
     
    public applyForce(force: THREE.Vector3): void {
        if (!this.rigidBody.isMoving()) for (const callback of this.onStartMove) callback();
        this.rigidBody.applyForce(force);
    }

    public reflect(normal: THREE.Vector3, magnitude: number = 1): void {
        const velocity = this.rigidBody.getVelocity();
        velocity.reflect(normal).multiplyScalar(magnitude);
        this.stop();
        this.applyForce(velocity);
    }

    public isMoving(): boolean {
        return this.rigidBody.isMoving();
    }

    public stop(): void {
        this.rigidBody.stop();
        for (const callback of this.onStopMove) callback();
    }
}