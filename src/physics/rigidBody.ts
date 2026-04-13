import * as THREE from "three";
import { Monobehavior } from "../monobehavior";
import { BodyType } from "../common/enums";

export class RigidBody extends Monobehavior {
    public readonly type: BodyType;
    public size: number = 1;
    public mass: number = 1;
    public absorption: number = 0.1;
    public friction: number = 0.1;
    public readonly mesh: THREE.Mesh;

    public onFreeze: (() => void)[] = [];
    public onUnfreeze: (() => void)[] = [];
    
    private velocity: THREE.Vector3 = new THREE.Vector3();
    private _freezed: boolean = false;

    public constructor(mesh: THREE.Mesh, type: BodyType = BodyType.STATIC) {
        super();
        
        this.mesh = mesh;
        this.type = type;
    }

    public update(delta: number): void {
        this.mesh.position.addScaledVector(this.velocity, delta);
    }

    public applyForce(force: THREE.Vector3): RigidBody {
        this.velocity.add(force);
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
        return this;
    }

    public freezed(): boolean {
        return this._freezed;
    }

    public freeze(): void {
        this._freezed = true;
        for (const callback of this.onFreeze) callback();
    }

    public unfreeze(): void {
        this._freezed = false;
        for (const callback of this.onUnfreeze) callback();
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