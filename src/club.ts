import * as THREE from "three";
import { Ball } from "./ball";
import { Monobehavior } from "./monobehavior";

export class Club extends Monobehavior {
    public enabled: boolean = true;
    public arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 0.5, new THREE.Color(0, 0, 255));

    public readonly onStartShot: (() => void)[] = [];
    public readonly onFreeShot: ((force: THREE.Vector3) => void)[] = [];
    
    private readonly maxStrength = 5;
    private readonly timeToMaxStrengthInSeconds = 3;
    private readonly strengthGainRate = this.maxStrength / this.timeToMaxStrengthInSeconds;
    private strength = 0;
    private isHolding = false;

    private normal = new THREE.Vector3(0, 1, 0);
    private direction = new THREE.Vector3();
    private ball: Ball;

    public constructor(ball: Ball) {
        super();

        this.ball = ball;
    }

    public update(delta: number) {
        if (this.isHolding) {
            this.strength += this.strengthGainRate * delta;
            this.strength = Math.min(this.strength, this.maxStrength);
            this.arrow.scale.set(this.strength / 5, this.strength / 5, this.strength / 5);
        } else {
            this.arrow.scale.set(1, 1, 1);
        }
    }

    public startShot(): void {
        if (!this.enabled) return;
        // if (!this.ball.rigidBody.canInteract()) return;

        this.strength = 0;
        this.isHolding = true;

        for (const callback of this.onStartShot) callback();
    }

    public freeShot(): void {
        console.log("Trying to free shot...");
        // if (!this.ball.rigidBody.canInteract()) return;
        console.log("After chekding");

        const force = new THREE.Vector3().copy(this.direction).multiplyScalar(this.strength);
        // this.ball.rigidBody.applyForce(force);
        
        this.strength = 0;
        this.isHolding = false;

        for (const callback of this.onFreeShot) callback(force);
    }

    public showArrow(): void {
        this.arrow.position.copy(this.ball.mesh.position);
        this.arrow.visible = true;
    }

    public hideArrow(): void {
        this.arrow.visible = false;
    }

    public calculateDirection(camera: THREE.PerspectiveCamera, event: MouseEvent, rect: DOMRect, ball: Ball): void {
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1,
        )

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const plane = new THREE.Plane();
        plane.set(this.normal, -ball.mesh.position.y);

        const point = new THREE.Vector3();

        if (raycaster.ray.intersectPlane(plane, point)) {
            const dir = new THREE.Vector3().subVectors(point, ball.mesh.position).normalize().multiplyScalar(-1);
        
            this.direction.set(...dir.toArray());
            this.arrow.setDirection(dir);
        }
    }
}