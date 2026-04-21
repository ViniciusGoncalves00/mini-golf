import { Match } from "./match";
import { CameraType } from "../common/enums";
import { User } from "../user";
import { Course } from "../course/course";

export class SinglePlayerMatch extends Match {
    public constructor(canvas: HTMLElement, courses: Course[], players: User[]) {
        super(canvas, courses, players);

        const user = this.users[0];
        this.placeBall(user);

        this.balls[0].rigidBody.onFreeze.push(() => this.club.showDirectionGizmo());
        this.balls[0].rigidBody.onUnfreeze.push(() => this.club.hideDirectionGizmo());
        
        this.club.onFreeShot.push((force) => {
            const body = this.world.rigidBodies.find((rb) => rb.mesh.uuid === user.getID().value);
            if (!body) return;

            body.unfreeze();
            body.applyForce(force);
            this.club.hideDirectionGizmo();
        })

        this.world.sceneWrapper.renderer.domElement.addEventListener("mousemove", (e) => {
            const rigidBody = this.world.rigidBodies.find((rb) => rb.mesh.uuid === user.getID().value);
            if (!rigidBody) return;

            this.club.calculateDirection(this.world.cameraWrapper.camera, e, this.world.sceneWrapper.renderer.domElement.getBoundingClientRect(), rigidBody)
        })

        this.world.sceneWrapper.renderer.domElement.addEventListener("mousedown", (e) => {
            if (e.button == 2) this.club.startShot();
        })

        this.world.sceneWrapper.renderer.domElement.addEventListener("mouseup", (e) => {
            if (e.button == 2) this.club.freeShot();
        })

        const rigidBody = this.world.rigidBodies.find((rb) => rb.mesh.uuid === user.getID().value);
        if (rigidBody) this.world.cameraWrapper.setTargetMode(rigidBody);
        
        document.addEventListener("keypress", (e) => {
            if (e.key === "t") {
                if (this.world.cameraWrapper.cameraMode === CameraType.FREE) {
                    const rigidBody = this.world.rigidBodies.find((rb) => rb.mesh.uuid === user.getID().value);
                    if (!rigidBody) return;

                    this.world.cameraWrapper.setTargetMode(rigidBody);
                } else if (this.world.cameraWrapper.cameraMode === CameraType.TARGET) {
                    this.world.cameraWrapper.setFreeMode();
                }
            }
        })
    }
}