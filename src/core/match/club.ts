import * as THREE from "three";
import { Ball } from "./ball";
import { Monobehavior } from "../monobehavior";
import { RigidBody } from "../physics/rigidBody";

export class Club extends Monobehavior {
    public arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 0.2, new THREE.Color(255, 255, 255));

    //#region [callbacks]
    public readonly onStartShot: (() => void)[] = [];
    public readonly onFreeShot: ((force: THREE.Vector3) => void)[] = [];
    public readonly onPercentageChanges: ((strength: number) => void)[] = [];
    //#endregion
    
    private readonly maxStrength = 10;
    private readonly timeToMaxStrengthInSeconds = 5;
    private readonly percentageGainRate = 1 / this.timeToMaxStrengthInSeconds;
    private percentage = 0;
    private isHolding = false;

    private normal = new THREE.Vector3(0, 1, 0);
    private direction = new THREE.Vector3();

    public constructor() {
        super();

        this.onPercentageChanges.push((percentage) => {
            const powerBar = document.getElementById("power-bar")!;
            powerBar.style.height = `${percentage * 100}%`;
            powerBar.style.background = `hsl(${(1 - percentage) * 120}, 50%, 50%)`;
        });
    }

    public update(delta: number) {
        if (this.isHolding) {
            this.percentage += this.percentageGainRate * delta;

            this.percentage = Math.min(this.percentage, 1);
            for (const callback of this.onPercentageChanges) {
                callback(this.percentage);
            }
        }
    }

    public startShot(): void {
        if (!this.enabled()) return;

        this.percentage = 0;
        this.isHolding = true;

        for (const callback of this.onStartShot) callback();
    }

    public freeShot(): void {
        const strength = this.percentage * this.maxStrength;
        const force = new THREE.Vector3().copy(this.direction).multiplyScalar(strength);
        
        this.percentage = 0;
        this.isHolding = false;

        for (const callback of this.onFreeShot) callback(force);
        for (const callback of this.onPercentageChanges) callback(0);
    }

    public enable(): void {
        super.enable();
        this.arrow.visible = true;
    }

    public disable(): void {
        super.disable();
        this.arrow.visible = false;
    }

    public calculateDirection(camera: THREE.PerspectiveCamera, event: MouseEvent, rect: DOMRect, body: RigidBody): void {
        this.arrow.position.copy(body.mesh.position);

        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1,
        )

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const plane = new THREE.Plane();
        plane.set(this.normal, -body.mesh.position.y);

        const point = new THREE.Vector3();

        if (raycaster.ray.intersectPlane(plane, point)) {
            const dir = new THREE.Vector3().subVectors(point, body.mesh.position).normalize().multiplyScalar(-1);
        
            this.direction.set(...dir.toArray());
            this.arrow.setDirection(dir);
        }
    }
}