import * as THREE from "three";
import { Monobehavior } from "../monobehavior";
import { SceneWrapper } from "../wrappers/scene-wrapper";
import { CameraWrapper } from "../wrappers/camera-wrapper";
import { Ambient } from "../physics/ambient";
import { RigidBody } from "../physics/rigidBody";
import { VectorUtils } from "../utils";
import { degToRad, radToDeg } from "three/src/math/MathUtils.js";
import { BodyType } from "../common/enums";

/**
 * Class to handle only with objects in a scene.
 */
export class World {
    public readonly rigidBodies: RigidBody[] = [];
    public readonly staticBodies: RigidBody[] = [];
    public readonly kinematicBodies: RigidBody[] = [];
    public readonly dynamicBodies: RigidBody[] = [];
    
    private readonly raycaster = new THREE.Raycaster();
    private readonly interpolation: number = 0.5;
    private readonly rollbackHeight: number = 0;
    
    public readonly sceneWrapper: SceneWrapper;
    public readonly cameraWrapper: CameraWrapper;
        
    public constructor(canvas: HTMLElement) {
        this.cameraWrapper = new CameraWrapper(canvas);
        this.sceneWrapper = new SceneWrapper(canvas, this.cameraWrapper.camera);
    }

    public update(delta: number) {
        this.cameraWrapper.update(delta);
        this.sceneWrapper.update(delta);

        for (const dynamicBody of this.dynamicBodies) {
            if (dynamicBody.freezed()) continue;
            this.simulateDynamicBody(delta, dynamicBody);
        };
    }

    public addBody(body: RigidBody): void {
        switch (body.type) {
            case BodyType.DYNAMIC: this.dynamicBodies.push(body); break;
            case BodyType.KINEMATIC: this.kinematicBodies.push(body); break;
            case BodyType.STATIC: this.staticBodies.push(body); break;
            default: break;
        }
        this.rigidBodies.push(body);
        this.sceneWrapper.scene.add(body.mesh);
    }

    public removeBody(body: RigidBody): void {
        switch (body.type) {
            case BodyType.DYNAMIC:
                var index = this.dynamicBodies.findIndex(b => b == body);
                this.dynamicBodies.splice(index, 1);
                break;
            case BodyType.KINEMATIC:
                var index = this.kinematicBodies.findIndex(b => b == body);
                this.kinematicBodies.splice(index, 1);
                break;
            case BodyType.STATIC:
                var index = this.staticBodies.findIndex(b => b == body);
                this.staticBodies.splice(index, 1);
                break;
            default: break;
        }
        var index = this.rigidBodies.findIndex(b => b == body);
        this.rigidBodies.splice(index, 1);
        this.sceneWrapper.scene.remove(body.mesh);
    }
    
    private simulateDynamicBody(delta: number, body: RigidBody): void {
        const speed = body.getSpeed();
        const distance = speed * delta;
        const maxMovePerStep = body.size * this.interpolation;
                    
        const steps = Math.max(1, Math.ceil(distance / maxMovePerStep));
        const stepDelta = delta / steps;

        for (let i = 0; i < steps; i++) {
            this.applyGravity(stepDelta, body);
            this.applyDrag(stepDelta, body);
            this.calculateCollision(body);
            body.update(stepDelta);
            this.mustFreeze(body);
        }

        this.rollback(body, this.rollbackHeight);
    }

    private simulateKinematicBody(delta: number, body: RigidBody): void {
        this.calculateCollision(body);
        body.update(delta);
        this.mustFreeze(body);
    }
    
    private applyGravity(delta: number, body: RigidBody, threshold: number = 0.0001): void {
        this.raycaster.set(body.mesh.position, VectorUtils.DOWN);
        this.raycaster.far = Infinity;

        const meshes = this.rigidBodies.values().toArray().map(body => body.mesh);
        const intersections = this.raycaster.intersectObjects(meshes);
        const hit = intersections[0];

        const isCollidingGround = hit && hit.distance <= body.size + threshold;
        const isPenetrating = hit && hit.distance < body.size;

        // if (isCollidingGround) {
        //     ball.lastGroundPosition.copy(hit.point.add(this.up.clone().multiplyScalar(ball.radius)));
        //     const inverseNormal = hit.face!.normal.clone().multiplyScalar(-1);
        //     ball.lastCollisionPosition.copy(ball.mesh.position.clone().add(inverseNormal.multiplyScalar(ball.radius)));

        //     if (hit.normal?.equals(this.up)) {
        //         ball.lastSafePosition.copy(ball.lastGroundPosition);
        //         ball.lastSafePosition.y += 0.1;
        //     };
        // }

        if (isPenetrating) body.mesh.position.y += body.size - hit.distance;
        if (!isCollidingGround) body.applyForce(Ambient.gravity.multiplyScalar(delta));
        // body.applyForce(Ambient.gravity.multiplyScalar(delta))
    }
    
    private calculateCollision(testBody: RigidBody) {
        const raycaster = new THREE.Raycaster();
        const forward = testBody.getDirection();
        raycaster.set(testBody.mesh.position, forward);

        const intersections = raycaster.intersectObjects(this.rigidBodies.map(body => body.mesh));
        const hit = intersections.find(intersection => intersection.object.uuid !== testBody.mesh.uuid);
        if (!hit) return;

        if (this.isColliding(forward, hit, testBody.size)) {
            const collidedBody = this.rigidBodies.find(body => body.mesh.uuid === hit.object.uuid);
            if (!collidedBody) return;

            if ((testBody.type && collidedBody.type) == BodyType.DYNAMIC) this.applyDynamicCollision(hit, testBody, collidedBody);
            else if (testBody.type == BodyType.DYNAMIC && collidedBody.type == BodyType.KINEMATIC) this.applyDynamicKinematicCollision(hit, testBody, collidedBody);
            else if (testBody.type == BodyType.KINEMATIC && collidedBody.type == BodyType.DYNAMIC) this.applyKinematicDynamicCollision(hit, collidedBody, testBody);
            else if (testBody.type == BodyType.DYNAMIC && collidedBody.type == BodyType.STATIC) this.applyStaticCollision(hit, testBody, collidedBody);

            // const inverseNormal = hit.face!.normal.clone().multiplyScalar(-1);
            // ball.lastCollisionPosition.copy(ball.mesh.position.clone().add(inverseNormal.multiplyScalar(ball.radius)));
        }
    }

    private applyDynamicCollision(hit: THREE.Intersection, movingBody: RigidBody, collidedBody: RigidBody): void {
        const forward = movingBody.getDirection();

        const normal = hit.face!.normal.clone();
        normal.transformDirection(hit.object.matrixWorld).normalize();

        const dot = forward.dot(normal);
        const absorptionFactor = (movingBody.absorption + collidedBody.absorption) * Math.abs(dot);

        const force = movingBody.getVelocity().multiplyScalar(absorptionFactor);

        collidedBody.applyForce(force);
        movingBody.reflect(normal, absorptionFactor);
    }

    private applyDynamicKinematicCollision(hit: THREE.Intersection, dynamicBody: RigidBody, kinematicBody: RigidBody): void {

    }

    private applyKinematicDynamicCollision(hit: THREE.Intersection, dynamicBody: RigidBody, kinematicBody: RigidBody): void {

    }

    private applyStaticCollision(hit: THREE.Intersection, dynamicBody: RigidBody, staticBody: RigidBody): void {
        const forward = dynamicBody.getDirection();

        const normal = hit.face!.normal.clone();
        normal.transformDirection(hit.object.matrixWorld).normalize();

        const dot = forward.dot(normal);
        const absorptionFactor = (dynamicBody.absorption + staticBody.absorption) * Math.abs(dot);
        dynamicBody.reflect(normal, absorptionFactor);
    }

    private applyDrag(delta: number, body: RigidBody, threshold: number = 0.01): void {
        this.raycaster.set(body.mesh.position, VectorUtils.DOWN);
        this.raycaster.far = Infinity;

        const meshes = this.rigidBodies.values().toArray().map(body => body.mesh);
        const intersections = this.raycaster.intersectObjects(meshes);
        const hit = intersections[0];

        const isCollidingGround = hit && hit.distance <= body.size + threshold;

        if (isCollidingGround) {
            const hitBody =this.rigidBodies.find(body => body.mesh.uuid === hit.object.uuid);
            if (!hitBody) return;

            body.applyDrag(hitBody.friction * delta);
        }

        body.applyDrag(Ambient.airDrag * delta);
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

    private mustFreeze(body: RigidBody, collisionThreshold: number = 0.01, speedThreshold: number = 0.01): void {
        this.raycaster.set(body.mesh.position, VectorUtils.DOWN);
        this.raycaster.far = Infinity;

        const meshes = this.rigidBodies.values().toArray().map(body => body.mesh);
        const intersections = this.raycaster.intersectObjects(meshes);
        const hit = intersections[0];

        const isCollidingGround = hit && hit.distance <= body.size + collisionThreshold;
        const isPenetrating = hit && hit.distance < body.size;

        if (isPenetrating) body.mesh.position.y += body.size - hit.distance;
        if (isCollidingGround && body.getSpeed() < speedThreshold) body.freeze();
    }

    private rollback(rigidBody: RigidBody, height: number): void {
        if (rigidBody.mesh.position.y > height) return;

        rigidBody.mesh.position.copy({x: 0, y: 1, z: 0});
        rigidBody.stop();
    }
}