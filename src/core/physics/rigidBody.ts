import * as THREE from "three";
import { Monobehavior } from "../monobehavior";
import { BodyType } from "../common/enums";

export class RigidBody extends Monobehavior {
    public readonly type: BodyType;
    public size: number = 1;
    public mass: number = 1;
    public absorption: number = 0.1;
    public dragCoeficient: number = 0.1;
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

        const speed = this.velocity.length();
        if (speed === 0) return;

        const radius = this.size;

        const axis = new THREE.Vector3().crossVectors(this.velocity, new THREE.Vector3(0, 1, 0)).normalize();

        const angularSpeed = speed / radius;
        const angle = angularSpeed * delta;

        this.mesh.rotateOnWorldAxis(axis, -angle);
    }

    public applyForce(force: THREE.Vector3): RigidBody {
        this.velocity.add(force);
        return this;
    }

    public applyDrag(dragCoeficient: number, fluidViscosity: number): RigidBody {
        const speed = this.getSpeed();
        const drag = dragCoeficient * fluidViscosity * Math.pow(speed, 2);
        this.velocity.multiplyScalar(1 - drag);
        return this;
    }

    public applyFriction(
        delta: number,
        normal: THREE.Vector3,
        options?: {
            muForward?: number,
            muSide?: number,
            forward?: THREE.Vector3,
            gravity?: THREE.Vector3,
        }
    ): RigidBody {
    
        if (this.velocity.lengthSq() === 0) return this;
    
        const velocity = this.velocity.clone();
    
        // remove componente normal
        const vNormal = normal.clone().multiplyScalar(velocity.dot(normal));
        const vTangent = velocity.clone().sub(vNormal);
    
        if (vTangent.lengthSq() === 0) return this;
    
        const gravity = options?.gravity ?? new THREE.Vector3(0, -9.81, 0);
    
        // aproximação da força normal
        const normalForce = Math.abs(gravity.dot(normal)) * this.mass;
    
        // modo isotrópico (fallback)
        if (!options?.forward) {
            const mu = options?.muForward ?? 0.5;
        
            const frictionMag = mu * normalForce;
        
            const frictionDir = vTangent.clone().normalize().multiplyScalar(-1);
            const friction = frictionDir.multiplyScalar(frictionMag * delta);
        
            // clamp (não inverter velocidade)
            if (friction.length() > vTangent.length()) {
                this.velocity.sub(vTangent);
            } else {
                this.velocity.add(friction);
            }
        
            return this;
        }
    
        // ===== ANISOTRÓPICO =====
    
        const forward = options.forward.clone().normalize();
        const side = new THREE.Vector3().crossVectors(normal, forward).normalize();
    
        const muForward = options.muForward ?? 0.3;
        const muSide = options.muSide ?? 1.0;
    
        // decomposição
        const vForward = forward.clone().multiplyScalar(vTangent.dot(forward));
        const vSide = side.clone().multiplyScalar(vTangent.dot(side));
    
        // helper
        const applyAxisFriction = (
            vComponent: THREE.Vector3,
            mu: number
        ) => {
            if (vComponent.lengthSq() === 0) return new THREE.Vector3();
        
            const frictionMag = mu * normalForce;
            const frictionDir = vComponent.clone().normalize().multiplyScalar(-1);
            const friction = frictionDir.multiplyScalar(frictionMag * delta);
        
            if (friction.length() > vComponent.length()) {
                return vComponent.clone().multiplyScalar(-1);
            }
        
            return friction;
        };
    
        const dvForward = applyAxisFriction(vForward, muForward);
        const dvSide = applyAxisFriction(vSide, muSide);
    
        this.velocity.add(dvForward).add(dvSide);
    
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
        this.stop();
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