import { Match } from "./match";
import { CameraType } from "../common/enums";
import { User } from "../user";
import { Course } from "../course/course";

export class SinglePlayerMatch extends Match {
    public constructor(canvas: HTMLElement, courses: Course[], players: User[]) {
        super(canvas, courses, players);

        const user = this.users[0];
        const ball = this.placeBall(user);

        ball.rigidBody.onFreeze.push(() => this.club.enable());
        ball.rigidBody.onUnfreeze.push(() => this.club.disable());
        this.club.enable();
        
        this.club.onFreeShot.push((force) => {
            const body = this.world.rigidBodies.find((rb) => rb.mesh.name === user.getID().get());
            if (!body) return;

            body.unfreeze();
            body.applyForce(force);
        })

        canvas.addEventListener("mousemove", (e) => {
            const rigidBody = this.world.rigidBodies.find((rb) => rb.mesh.name === user.getID().get());
            if (!rigidBody) return;

            this.club.calculateDirection(this.world.cameraWrapper.camera, e, canvas.getBoundingClientRect(), rigidBody)
        })

        canvas.addEventListener("mousedown", (e) => {
            if (e.button == 2) this.club.startShot();
        })

        canvas.addEventListener("mouseup", (e) => {
            if (e.button == 2) this.club.freeShot();
        })

        const rigidBody = this.world.rigidBodies.find((rb) => rb.mesh.name === user.getID().get());
        if (rigidBody) this.world.cameraWrapper.setTargetMode(rigidBody);
        
        document.addEventListener("keypress", (e) => {
            if (e.key === "t") {
                if (this.world.cameraWrapper.cameraMode === CameraType.FREE) {
                    const rigidBody = this.world.rigidBodies.find((rb) => rb.mesh.name === user.getID().get());
                    if (!rigidBody) return;

                    this.world.cameraWrapper.setTargetMode(rigidBody);
                } else if (this.world.cameraWrapper.cameraMode === CameraType.TARGET) {
                    this.world.cameraWrapper.setFreeMode();
                }
            }
        })
    }
}