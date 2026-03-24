import * as THREE from "three";
import { Monobehavior } from "../monobehavior";
import { World } from "./world";

export class RigidBody extends Monobehavior {
    private readonly position: THREE.Vector3;
    private readonly quaternion: THREE.Quaternion;
    private readonly velocity: THREE.Vector3 = new THREE.Vector3();
    private readonly mass: number = 1;

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
        return this;
    }

    public applyDrag(factor: number): RigidBody {
        this.velocity.multiplyScalar(1 - factor);
        return this;
    }
    
    public reflect(normal: THREE.Vector3, loss: number = 0): RigidBody {
        const velocity = this.getVelocity();
        velocity.reflect(normal).multiplyScalar(1 - loss);
        this.velocity.copy(velocity);
        return this;
    }

    public stop(): RigidBody {
        this.velocity.set(0, 0, 0);
        return this;
    }

    public isMoving(): boolean {
        return this.velocity.length() > 0.5;
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