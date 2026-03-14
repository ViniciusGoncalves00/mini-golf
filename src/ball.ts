import * as THREE from "three";
import { Monobehavior } from "./monobehavior";

export class Ball extends Monobehavior {
    private velocity = new THREE.Vector3();
    public readonly mesh: THREE.Mesh;

    private stopThreshold = 1;

    public constructor(mesh: THREE.Mesh) {
        super();
        
        this.mesh = mesh;
    }

    public update(delta: number): void {
        this.updateBallMotion(delta)
    }
     
    public applyForce(force: THREE.Vector3): void {
        this.velocity.add(force);
    }

    public isMoving(): boolean {
        return this.velocity.length() > 0;
    }

    private updateBallMotion(delta: number): void {
        if (this.velocity.lengthSq() === 0) return;

        this.mesh.position.addScaledVector(this.velocity, delta);

        const friction = 0.98;
        this.velocity.multiplyScalar(friction);
        
        if (this.velocity.length() < this.stopThreshold) {
            this.velocity.set(0, 0, 0);
        }

        // network.send({
        //     type: "ball-position",
        //     position: [...ball.position.toArray()]
        // })

        // updateArrowPosition(directionalArrow, ball);
    }
}