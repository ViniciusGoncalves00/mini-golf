import * as THREE from "three";
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
    private readonly interpolation: number = 1;
    private readonly rollbackHeight: number = 0;
    
    public readonly sceneWrapper: SceneWrapper;
    public readonly cameraWrapper: CameraWrapper;

    public onCollision: ((bodyA: RigidBody, bodyB: RigidBody, intensity: number) => void)[] = [];
        
    public constructor(canvas: HTMLElement) {
        this.cameraWrapper = new CameraWrapper(canvas);
        this.sceneWrapper = new SceneWrapper(canvas, this.cameraWrapper.camera);
        this.sceneWrapper.scene.add(this.cameraWrapper.cameraLight);

        let amount = 0;
        let total = 0;
        setInterval(() => {
            if (amount < total) {
                    for (let index = 0; index < 1; index++) {
                    const size = 0.023;
                    const test = new RigidBody(new THREE.Mesh(new THREE.SphereGeometry(size), new THREE.MeshPhysicalMaterial({color: 0xf0f0f0})), BodyType.DYNAMIC);
                    test.size = size;
                    test.absorption = 0.25;
                    test.mesh.castShadow = true;
                    test.mesh.position.set(Math.random() * 2, Math.random() * 3, Math.random() * 10);
                    test.enable();
                    test.unfreeze();
                    this.addBody(test)

                    amount++;
                }
            }
        }, 20);

        this.dynamicBodies.sort((a, b) => Number(a.mesh.name) - Number(b.mesh.name));
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
            case BodyType.DYNAMIC: 
                this.dynamicBodies.push(body);
                this.dynamicBodies.sort((a, b) => Number(a.mesh.name) - Number(b.mesh.name));
                break;
            case BodyType.KINEMATIC: this.kinematicBodies.push(body); break;
            case BodyType.STATIC: this.staticBodies.push(body); break;
            default: break;
        }
        
        this.rigidBodies.push(body);
        this.sceneWrapper.scene.add(body.mesh);
    }

    public removeBody(body: RigidBody): void {
        let index: number = 0;
        switch (body.type) {
            case BodyType.DYNAMIC:
                index = this.dynamicBodies.findIndex(b => b == body);
                this.dynamicBodies.splice(index, 1);
                break;
            case BodyType.KINEMATIC:
                index = this.kinematicBodies.findIndex(b => b == body);
                this.kinematicBodies.splice(index, 1);
                break;
            case BodyType.STATIC:
                index = this.staticBodies.findIndex(b => b == body);
                this.staticBodies.splice(index, 1);
                break;
            default: break;
        }
        index = this.rigidBodies.findIndex(b => b == body);
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
            if (body.freezed()) break;
            
            this.calculateDynamicCollision(body);
            this.calculateStaticCollision(body);

            const collisionInfo = this.groundCollisionData(body)
            this.applyGravity(stepDelta, body, collisionInfo.upon, collisionInfo.intersection);
            this.applyDrag(stepDelta, body);
            this.applyFriction(stepDelta, body, collisionInfo.upon, collisionInfo.intersection);

            body.update(stepDelta);

            if (collisionInfo.under && collisionInfo.intersection) this.correctPenetration(body, collisionInfo.intersection);
            this.mustFreeze(body, collisionInfo.grounded);
        }

        this.rollback(body, this.rollbackHeight);
    }

    // private simulateKinematicBody(delta: number, body: RigidBody): void {
    //     this.calculateCollision(body);
    //     body.update(delta);
    //     this.mustFreeze(body);
    // }
    
    private applyGravity(delta: number, body: RigidBody, isGrounded: boolean, hit: THREE.Intersection | null): void {
        if (!isGrounded || !hit) {
            body.applyForce(Ambient.gravity.clone().multiplyScalar(delta));
            return;
        }

        const normal = hit.face!.normal.clone();
        normal.transformDirection(hit.object.matrixWorld).normalize();

        const gravity = Ambient.gravity;
        const magnitude = gravity.length();
        const vector = gravity.normalize();
        
        const gravityAlongSurface = vector.add(normal.clone());
        gravityAlongSurface.multiplyScalar(magnitude);

        body.applyForce(gravityAlongSurface.multiplyScalar(delta));
    }

    private correctPenetration(body: RigidBody, hit: THREE.Intersection, threshold: number = 0.0001): void {
        const depth = body.size - hit.distance;

        if (depth > 0) {
            const normal = hit.face!.normal.clone();
            normal.transformDirection(hit.object.matrixWorld).normalize();

            body.mesh.position.add(
                normal.multiplyScalar(depth + threshold)
            );
        }
    }
    
    private calculateCollision(testBody: RigidBody) {
        const raycaster = new THREE.Raycaster();
        const forward = testBody.getDirection();
        raycaster.set(testBody.mesh.position, forward);

        const intersections = raycaster.intersectObjects(this.rigidBodies.map(body => body.mesh));
        const hit = intersections.find(intersection => intersection.object.uuid !== testBody.mesh.uuid);
        if (!hit) return;

        if (this.isSphereCollidingForward(forward, hit, testBody.size)) {
            const collidedBody = this.rigidBodies.find(body => body.mesh.uuid === hit.object.uuid);
            if (!collidedBody) return;

            if (testBody.type === BodyType.DYNAMIC && collidedBody.type === BodyType.DYNAMIC) this.applyDynamicCollision(hit, testBody, collidedBody);
            else if (testBody.type === BodyType.DYNAMIC && collidedBody.type === BodyType.KINEMATIC) this.applyDynamicKinematicCollision(hit, testBody, collidedBody);
            else if (testBody.type === BodyType.KINEMATIC && collidedBody.type === BodyType.DYNAMIC) this.applyKinematicDynamicCollision(hit, collidedBody, testBody);
            else if (testBody.type === BodyType.DYNAMIC && collidedBody.type === BodyType.STATIC) this.applyStaticCollision(hit, testBody, collidedBody);

            // const inverseNormal = hit.face!.normal.clone().multiplyScalar(-1);
            // ball.lastCollisionPosition.copy(ball.mesh.position.clone().add(inverseNormal.multiplyScalar(ball.radius)));
        }
    }

    private calculateDynamicCollision(testBody: RigidBody): void {
        for (let index = 0; index < this.dynamicBodies.length; index++) {
            const body = this.dynamicBodies[index];
            if (testBody.mesh.uuid === body.mesh.uuid) continue;
            
            const distance = testBody.mesh.position.distanceTo(body.mesh.position);
            const hit = distance <= testBody.size + body.size;

            if (!hit) continue;

            const forward = body.mesh.position.clone().sub(testBody.mesh.position).normalize();
            const dot = testBody.getDirection().dot(forward);
            if (dot <= 0) continue;

            this.raycaster.set(testBody.mesh.position, forward);

            const intersection = this.raycaster.intersectObject(body.mesh)[0];
            this.applyDynamicCollision(intersection, testBody, body);
            return;
        }
    }

    private calculateStaticCollision(testBody: RigidBody): void {
        const raycaster = new THREE.Raycaster();
        const forward = testBody.getDirection();
        raycaster.set(testBody.mesh.position, forward);

        const intersections = raycaster.intersectObjects(this.staticBodies.map(body => body.mesh));
        const hit = intersections.find(intersection => intersection.object.uuid !== testBody.mesh.uuid);
        if (!hit) return;

        if (this.isSphereCollidingForward(forward, hit, testBody.size)) {
            const collidedBody = this.staticBodies.find(body => body.mesh.uuid === hit.object.uuid);
            if (!collidedBody) return;

            this.applyStaticCollision(hit, testBody, collidedBody)
        }
    }

    private applyDynamicCollision(hit: THREE.Intersection, movingBody: RigidBody, collidedBody: RigidBody): void {
        const forward = movingBody.getDirection();
        if (!hit || !hit.face) return;

        const normal = hit.face!.normal.clone();
        normal.transformDirection(hit.object.matrixWorld).normalize();

        const dot = forward.dot(normal);
        const absorptionFactor = (movingBody.absorption + collidedBody.absorption) * Math.abs(dot);

        const force = movingBody.getVelocity().multiplyScalar(1 - absorptionFactor);

        collidedBody.unfreeze();
        collidedBody.applyForce(force);
        movingBody.reflect(normal, absorptionFactor);

        for (const callback of this.onCollision) callback(movingBody, collidedBody, THREE.MathUtils.clamp(movingBody.getSpeed(), 0, 1) * Math.abs(dot));
    }

    private applyDynamicKinematicCollision(hit: THREE.Intersection, dynamicBody: RigidBody, kinematicBody: RigidBody): void {

    }

    private applyKinematicDynamicCollision(hit: THREE.Intersection, dynamicBody: RigidBody, kinematicBody: RigidBody): void {

    }

    private applyStaticCollision(hit: THREE.Intersection, dynamicBody: RigidBody, staticBody: RigidBody): void {
        const forward = dynamicBody.getDirection();
        if (!hit.face) return;

        const normal = hit.face!.normal.clone();
        normal.transformDirection(hit.object.matrixWorld).normalize();

        const dot = forward.dot(normal);
        const absorptionFactor = (dynamicBody.absorption + staticBody.absorption) * Math.abs(dot);
        dynamicBody.reflect(normal, absorptionFactor);

        for (const callback of this.onCollision) callback(dynamicBody, staticBody, THREE.MathUtils.clamp(dynamicBody.getSpeed(), 0, 1)* Math.abs(dot));
    }

    private groundCollisionData(body: RigidBody, buffer: number = 1.05): {
        upon: boolean,
        under: boolean,
        grounded: boolean,
        intersection: THREE.Intersection | null
    } {
        this.raycaster.set(body.mesh.position, VectorUtils.DOWN);
        this.raycaster.far = Infinity;

        const meshes = this.staticBodies.map(body => body.mesh);
        const intersections = this.raycaster.intersectObjects(meshes);
        const hit = intersections[0];

        const upon = hit && hit.distance < body.size * buffer;
        const under = hit && hit.distance < body.size;
        const grounded = hit && Math.abs(hit.distance - body.size) < 0.001;
        return { upon: upon, under: under, grounded: grounded, intersection: hit ? hit : null };
    }

    private applyDrag(delta: number, body: RigidBody): void {
        const coeficient = body.dragCoeficient * delta;
        body.applyDrag(coeficient, Ambient.airViscosity);
    }

    private applyFriction(delta: number, body: RigidBody, isGrounded: boolean, hit: THREE.Intersection | null): void {
        if (!isGrounded || !hit) return;

        const hitBody = this.staticBodies.find(body => body.mesh.uuid === hit.object.uuid);
        if (!hitBody) return;

        const coeficient = (body.dragCoeficient + hitBody.dragCoeficient) * delta;
        const normal = hit.face!.normal.clone();
        normal.transformDirection(hit.object.matrixWorld).normalize();

        body.applyFriction(delta, normal, {
            forward: body.getDirection(),
            muForward: 0.2,
            muSide: 1.5,
            gravity: Ambient.gravity
        });
    }
    
    private isSphereCollidingForward(direction: THREE.Vector3, hit: THREE.Intersection, radius: number, threshold: number = 0.0001): boolean {
        if (!hit.face) return false;

        const inverseNormal = hit.face!.normal.clone().multiplyScalar(-1);
        const angle = radToDeg(inverseNormal.angleTo(direction));

        const cossine = Math.cos(degToRad(angle));
        const hypotenuse = hit.distance;

        const adjacentSide = cossine * hypotenuse;
        const distance = adjacentSide - radius;

        const isColliding = distance < threshold;
        return isColliding;
    }

    private boxCollision(body: RigidBody): void {
        const pos = body.mesh.position;
        const size = body.size;

        const min = new THREE.Vector3(pos.x - size, pos.y - size, pos.z - size);
        const max = new THREE.Vector3(pos.x + size, pos.y + size, pos.z + size);
        const box = new THREE.Box3(min, max);
    }

    private mustFreeze(body: RigidBody, isGrounded: boolean, speedThreshold: number = 0.01): void {
        if (isGrounded && body.getSpeed() < speedThreshold) body.freeze();
    }

    private rollback(rigidBody: RigidBody, height: number): void {
        if (rigidBody.mesh.position.y > height) return;

        rigidBody.mesh.position.copy({x: 1, y: 1, z: 0});
        rigidBody.stop();
    }
}