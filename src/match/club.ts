import * as THREE from "three";
import { Ball } from "./ball";
import { Monobehavior } from "../monobehavior";

export class Club extends Monobehavior {
    public arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 0.2, new THREE.Color(255, 255, 255));

    //#region [callbacks]
    public readonly onStartShot: (() => void)[] = [];
    public readonly onFreeShot: ((force: THREE.Vector3) => void)[] = [];
    public readonly onStrengthChange: ((strength: number) => void)[] = [];
    //#endregion
    
    private readonly maxStrength = 10;
    private readonly timeToMaxStrengthInSeconds = 5;
    private readonly strengthGainRate = this.maxStrength / this.timeToMaxStrengthInSeconds;
    private strength = 0;
    private isHolding = false;

    private normal = new THREE.Vector3(0, 1, 0);
    private direction = new THREE.Vector3();
    private ball: Ball;

    public constructor(ball: Ball) {
        super();

        this.ball = ball;

        const powerBar = document.getElementById("power-bar")!;
        this.onStrengthChange.push((strength) => {
            powerBar.style.height = `${strength * 100}%`;
            powerBar.style.background = `hsl(${(1 - strength) * 120}, 50%, 50%)`;
        });

    }

    public update(delta: number) {
        if (this.isHolding) {
            this.strength += this.strengthGainRate * delta;

            this.strength = Math.min(this.strength, this.maxStrength);

            const normalized = this.strength / this.maxStrength;

            for (const callback of this.onStrengthChange) {
                callback(normalized);
            }
        }
        this.arrow.position.copy(this.ball.rigidBody.mesh.position);
    }

    public startShot(): void {
        if (!this.ball.rigidBody.enabled() || !this.ball.rigidBody.freezed()) return;

        this.strength = 0;
        this.isHolding = true;

        for (const callback of this.onStartShot) callback();
    }

    public freeShot(): void {
        const force = new THREE.Vector3().copy(this.direction).multiplyScalar(this.strength);
        
        this.strength = 0;
        this.isHolding = false;

        for (const callback of this.onFreeShot) callback(force);
        for (const callback of this.onStrengthChange) callback(0);
    }

    public showDirectionGizmo(): void {
        this.arrow.visible = true;
    }

    public hideDirectionGizmo(): void {
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
        plane.set(this.normal, -ball.rigidBody.mesh.position.y);

        const point = new THREE.Vector3();

        if (raycaster.ray.intersectPlane(plane, point)) {
            const dir = new THREE.Vector3().subVectors(point, ball.rigidBody.mesh.position).normalize().multiplyScalar(-1);
        
            this.direction.set(...dir.toArray());
            this.arrow.setDirection(dir);
        }
    }
}