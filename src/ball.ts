import * as THREE from "three";
import { Monobehavior } from "./monobehavior";
import { Course } from "./course";

export class Ball extends Monobehavior {
    public velocity = new THREE.Vector3();
    public readonly mesh: THREE.Mesh;

    public readonly onStartMove: (() => void)[] = [];
    public readonly onStopMove: (() => void)[] = [];

    private readonly stopThreshold = 0.1;

    public constructor(mesh: THREE.Mesh) {
        super();
        
        this.mesh = mesh;
    }

    public update(delta: number): void {
        this.updateMovement(delta);
    }
     
    public applyForce(force: THREE.Vector3): void {
        if (!this.isMoving()) for (const callback of this.onStartMove) callback();
        this.velocity.add(force);
    }

    public isMoving(): boolean {
        return this.velocity.length() > 0;
    }

    public getDirection(): THREE.Vector3 {
        return this.velocity.clone().normalize();
    }

    public stop(): void {
        this.velocity.set(0, 0, 0);
        for (const callback of this.onStopMove) callback();
    }

    private updateMovement(delta: number): void {
        if (this.velocity.lengthSq() === 0) return;

        this.mesh.position.addScaledVector(this.velocity, delta);

        const friction = 0.99;
        this.velocity.multiplyScalar(friction);
        
        if (this.velocity.length() < this.stopThreshold) {
            this.stop();
        }

        // network.send({
        //     type: "ball-position",
        //     position: [...ball.position.toArray()]
        // })

        // updateArrowPosition(directionalArrow, ball);
    }
}