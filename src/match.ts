import * as THREE from "three";
import { Course } from "./course";
import { Player } from "./player";
import { Global } from "./global";
import { Ball } from "./ball";
import { World } from "./physics/world";
import { degToRad, radToDeg } from "three/src/math/MathUtils.js";
import { CameraWrapper } from "./wrappers/camera-wrapper";
import { SceneWrapper } from "./wrappers/scene-wrapper";
import { Monobehavior } from "./monobehavior";

export class Match {
    public readonly monobehaviors: Monobehavior[] = [];
    
    public readonly player: Player;
    public readonly players: Player[] = [];
    public readonly courses: Course[] = [];

    public currentPlayer: Player | null = null;
    public turnIndex: number = -1;
    
    private currentCourse: Course | null = null;
    private currentCourseIndex: number = -1;

    public physicSimulationEnabled: boolean = true;

    private readonly timer: THREE.Timer = new THREE.Timer();
    private readonly raycaster = new THREE.Raycaster();
    private readonly up = new THREE.Vector3(0, 1, 0);
    private readonly down = new THREE.Vector3(0, -1, 0);
    private readonly interpolation: number = 0.5;
    private readonly rollbackHeight: number = 0;

    private readonly sceneWrapper: SceneWrapper;
    private readonly cameraWrapper: CameraWrapper;
    
    public constructor(canvas: HTMLElement, player: Player, players: Player[], courses: Course[]) {
        this.player = player;
        this.players = players;
        this.courses = courses;

        this.monobehaviors.push(this.player.ball);
        this.monobehaviors.push(this.player.club);

        for (const player of players) {
            this.monobehaviors.push(player.ball);
            this.monobehaviors.push(player.club);
        }

        for (const course of courses) {
            this.monobehaviors.push(...course.tiles.values().toArray());
        }

        this.cameraWrapper = new CameraWrapper(canvas, this.player.ball);
        this.monobehaviors.push(this.cameraWrapper);

        this.sceneWrapper = new SceneWrapper(canvas, this.cameraWrapper.camera);
        this.monobehaviors.push(this.sceneWrapper);
        
        this.nextCourse();

        this.animate();
    }

    public nextCourse(): void {
        this.currentCourseIndex++;

        this.currentCourse?.dispose();
        this.currentCourse = this.courses[this.currentCourseIndex];
        this.currentCourse.load();
        this.currentCourse.tiles.values().forEach((tile) => {
            this.sceneWrapper.scene.add(tile.mesh);
        })

        this.currentPlayer = null;
        this.turnIndex = -1;
        this.players.forEach(player => {
            this.sceneWrapper.scene.remove(player.ball.mesh);
            this.sceneWrapper.scene.remove(player.ball.arrow);
            this.sceneWrapper.scene.remove(player.ball.groundDebug);
            this.sceneWrapper.scene.remove(player.ball.colliderDebug);
            this.sceneWrapper.scene.remove(player.club.arrow);
        })
        this.nextPlayer();
    }

    public nextPlayer(): void {
        this.turnIndex >= this.players.length ? this.turnIndex = 0 : this.turnIndex++;

        this.currentPlayer = this.players[this.turnIndex];

        if (!this.currentPlayer.ball.isLoaded) {
            this.currentPlayer.ball.isLoaded = true;

            this.sceneWrapper.scene.add(this.currentPlayer.ball.mesh);
            this.sceneWrapper.scene.add(this.currentPlayer.ball.arrow);
            this.sceneWrapper.scene.add(this.currentPlayer.ball.groundDebug);
            this.sceneWrapper.scene.add(this.currentPlayer.ball.colliderDebug);
            this.sceneWrapper.scene.add(this.currentPlayer.club.arrow);

            this.currentPlayer.ball.mesh.position.set(0, 1, 0);

            this.sceneWrapper.renderer.domElement.addEventListener("mousemove", (e) => {
                this.currentPlayer?.club.calculateDirection(this.cameraWrapper.camera, e, this.sceneWrapper.renderer.domElement.getBoundingClientRect(), this.currentPlayer?.ball)
            })

            this.sceneWrapper.renderer.domElement.addEventListener("mousedown", (e) => {
                if (e.button == 2) this.currentPlayer?.club.startShot();
            })

            this.sceneWrapper.renderer.domElement.addEventListener("mouseup", (e) => {
                if (e.button == 2) this.currentPlayer?.club.freeShot();
            })
        }
    }

    private animate = () => {
        requestAnimationFrame(this.animate);

        this.timer.update();
        const delta = this.timer.getDelta() * Global.timeScale;
    
        for (const monobehavior of this.monobehaviors) monobehavior.update(delta);
        if (this.physicSimulationEnabled) this.simulatePhysics(delta);
        
        const ball = this.player.ball;
        const club = this.player.club;
        
        ball.rigidBody.canInteract() ? club.showArrow() : club.hideArrow();

    }

    private simulatePhysics(delta: number): void {
        if (!this.currentCourse) return;
        
        for (const player of this.players) {
            const ball = player.ball;
            if (!player.ball.enabled) continue;

            const speed = ball.rigidBody.getSpeed();
            const distance = speed * delta;
            const maxMovePerStep = ball.diameter * this.interpolation;
                    
            const steps = Math.max(1, Math.ceil(distance / maxMovePerStep));
            const stepDelta = delta / steps;
                    
            for (let i = 0; i < steps; i++) {
                this.simulateStep(stepDelta, ball, this.currentCourse);
            }

            this.rollback(ball, this.rollbackHeight);
        }
    }


    private simulateStep(delta: number, ball: Ball, course: Course): void {
        this.gravity(delta, ball, course);
        this.applyDrag(delta, ball, course);
        this.calculateCollision(delta, ball, course);
        ball.rigidBody.update(delta);
        this.mustStop(ball);
    }

    private gravity(delta: number, ball: Ball, course: Course, threshold: number = 0.001): void {
        this.raycaster.set(ball.mesh.position, this.down);
        this.raycaster.far = Infinity;

        const intersections = this.raycaster.intersectObjects(
            course.tiles.values().toArray().map(t => t.mesh)
        );
        const hit = intersections[0];

        ball.isCollidingGround = hit && hit.distance <= ball.radius + threshold;
        ball.isPenetrating = hit && hit.distance < ball.radius;

        if (ball.isCollidingGround) {
            ball.lastGroundPosition.copy(hit.point.add(this.up.clone().multiplyScalar(ball.radius)));
            const inverseNormal = hit.face!.normal.clone().multiplyScalar(-1);
            ball.lastCollisionPosition.copy(ball.mesh.position.clone().add(inverseNormal.multiplyScalar(ball.radius)));

            if (hit.normal?.equals(this.up)) {
                ball.lastSafePosition.copy(ball.lastGroundPosition);
                ball.lastSafePosition.y += 0.1;
            };
        }

        if (ball.isPenetrating) {
            ball.mesh.position.y += ball.radius - hit.distance;
        }

        if (!ball.isCollidingGround) {
            ball.rigidBody.applyForce(World.gravity.clone().multiplyScalar(delta));
        }
    }

    private calculateCollision(delta: number, ball: Ball, course: Course) {
        if (!ball.rigidBody.isMoving()) return;

        const raycaster = new THREE.Raycaster();
        const forward = new THREE.Vector3();

        forward.copy(ball.rigidBody.getDirection());
        raycaster.set(ball.mesh.position, forward);
        const intersections = raycaster.intersectObjects(course.tiles.values().toArray().map(t => t.mesh));

        if (intersections.length === 0) return;

        const hit = intersections.find(i => i.object.uuid !== ball.mesh.uuid);
        if (!hit) return;


        if (this.isColliding(forward, hit, ball.radius)) {
            const tile = course.tiles.values().toArray().find(tile => tile.mesh.uuid === hit.object.uuid);
            if (!tile) return;

            const inverseNormal = hit.face!.normal.clone().multiplyScalar(-1);
            ball.lastCollisionPosition.copy(ball.mesh.position.clone().add(inverseNormal.multiplyScalar(ball.radius)));

            const normal = hit.face!.normal.clone();
            normal.transformDirection(hit.object.matrixWorld).normalize();

            const dot = forward.dot(normal);
            const impactStrength = Math.abs(dot) * tile.absorption;
            ball.rigidBody.reflect(normal, impactStrength);
        }
    }

    private applyDrag(delta: number, ball: Ball, course: Course): void {
        
        if (ball.isCollidingGround) {
            const raycaster = new THREE.Raycaster();
            raycaster.set(ball.mesh.position, new THREE.Vector3(0, -1, 0));
            const intersections = raycaster.intersectObjects(course.tiles.values().toArray().map(t => t.mesh));
            const hit2 = intersections.find(i => i.object.uuid !== ball.mesh.uuid);
            if (!hit2) return;

            const tile2 = course.tiles.values().toArray().find(tile => tile.mesh.uuid === hit2.object.uuid);
            if (!tile2) return;

            ball.rigidBody.applyDrag(tile2.friction * delta);
        }

        ball.rigidBody.applyDrag(World.airDrag * delta);
    }

    private isColliding(direction: THREE.Vector3, hit: THREE.Intersection, radius: number, threshold: number = 0.0001) {
        const inverseNormal = hit.face!.normal.clone().multiplyScalar(-1);
        const angle = radToDeg(inverseNormal.angleTo(direction));

        const cossine = Math.cos(degToRad(angle));
        const hypotenuse = hit.distance;

        const adjacentSide = cossine * hypotenuse;
        const distance = adjacentSide - radius;

        const isColliding = distance < threshold;
        return isColliding;
    }

    private mustStop(ball: Ball, threshold: number = 0.1): void {
        if (!ball.isCollidingGround || ball.rigidBody.getSpeed() > threshold) return;
        
        ball.rigidBody.stop();
    }

    private rollback(ball: Ball, height: number): void {
        if (ball.mesh.position.y > height) return;

        ball.mesh.position.copy(ball.lastSafePosition);
        ball.rigidBody.stop();
    }
}