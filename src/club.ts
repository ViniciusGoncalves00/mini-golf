import * as THREE from "three";
import { Ball } from "./ball";

export class Club {
    public arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 10, new THREE.Color(0, 0, 255));
    
    private normal = new THREE.Vector3(0, 1, 0);
    private direction = new THREE.Vector3();

    private readonly maxMagnitude = 100;
    private readonly strength = 1000;
    private before = 0;

    private currentBall: Ball | null = null;

    public startShot(ball: Ball): void {
        if (ball.isMoving()) return;

        this.currentBall = ball;
        this.before = Date.now();

        this.arrow.position.copy(ball.mesh.position);
        this.arrow.visible = true;
    }

    public freeShot(): void {
        if (!this.currentBall) return;

        const delta = (Date.now() - this.before) / 1000;
        const magnitude = Math.min(delta * this.strength, this.maxMagnitude);

        const force = new THREE.Vector3().copy(this.direction).multiplyScalar(magnitude);
        this.currentBall.applyForce(force)
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

        this.currentBall = null;
        this.arrow.visible = false;
    }
}