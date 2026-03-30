import * as THREE from "three";
import { Monobehavior } from "../monobehavior";
import { World } from "./world";

export class RigidBody extends Monobehavior {
    public readonly position: THREE.Vector3;
    public readonly quaternion: THREE.Quaternion;
    private readonly velocity: THREE.Vector3 = new THREE.Vector3();
    private readonly mass: number = 1;

    private wasStopped: boolean = false;

    public constructor(position: THREE.Vector3, quaternion: THREE.Quaternion) {
        super();

        this.position = position;
        this.quaternion = quaternion;
    }

    public update(delta: number): void {
        this.position.addScaledVector(this.velocity, delta);
    }

    public applyForce(force: THREE.Vector3): RigidBody {
        this.velocity.add(force);
        this.wasStopped = false;
        return this;
    }

    public applyDrag(factor: number): RigidBody {
        this.velocity.multiplyScalar(1 - (factor * this.getSpeed()));
        return this;
    }
    
    public reflect(normal: THREE.Vector3, factor: number = 0): RigidBody {
        this.velocity.reflect(normal).multiplyScalar(1 - factor);
        return this;
    }

    public stop(): RigidBody {
        this.velocity.set(0, 0, 0);
        this.wasStopped = true;
        return this;
    }

    public canInteract(): boolean {
        return this.wasStopped;
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
}