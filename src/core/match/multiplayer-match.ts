import { CameraType } from "../common/enums";
import { Course } from "../course/course";
import { User } from "../user";
import { Match } from "./match";

/**
 * Class to handle only with all match logic (world/scene, players, ui).
 */
export class MultiPlayerMatch extends Match {
    public myUser: User;
    public turnIndex: number = -1;
    
    public constructor(canvas: HTMLElement, courses: Course[], users: User[], myUser: User) {
        super(canvas, courses, users);

        this.myUser = myUser;

        this.club.onFreeShot.push((force) => {
            const body = this.world.rigidBodies.find((rb) => rb.mesh.name === this.myUser.getID().value);
            if (!body) return;

            body.unfreeze();
            body.applyForce(force);
            this.club.hideDirectionGizmo();
        })

        canvas.addEventListener("mousemove", (e) => {
            const rigidBody = this.world.rigidBodies.find((rb) => rb.mesh.name === this.myUser.getID().value);
            if (!rigidBody) return;

            this.club.calculateDirection(this.world.cameraWrapper.camera, e, canvas.getBoundingClientRect(), rigidBody)
        })

        canvas.addEventListener("mousedown", (e) => {
            if (e.button == 2) this.club.startShot();
        })

        canvas.addEventListener("mouseup", (e) => {
            if (e.button == 2) this.club.freeShot();
        })

        // const rigidBody = this.world.rigidBodies.find((rb) => rb.mesh.name === user.getID().value);
        // if (rigidBody) this.world.cameraWrapper.setTargetMode(rigidBody);
        
        document.addEventListener("keypress", (e) => {
            if (e.key === "t") {
                if (this.world.cameraWrapper.cameraMode === CameraType.FREE) {
                    const rigidBody = this.world.rigidBodies.find((rb) => rb.mesh.name === this.myUser.getID().value);
                    if (!rigidBody) return;

                    this.world.cameraWrapper.setTargetMode(rigidBody);
                } else if (this.world.cameraWrapper.cameraMode === CameraType.TARGET) {
                    this.world.cameraWrapper.setFreeMode();
                }
            }
        })
        
        this.nextPlayer();
    }

    // public nextCourse(): void {
    //     super.nextCourse();

    //     this.currentPlayer = null;
    //     this.turnIndex = -1;
    // }

    public nextPlayer(): void {
        this.turnIndex++;
        if (this.turnIndex >= this.users.length) this.turnIndex = 0;
        const current = this.users[this.turnIndex];

        const loaded = this.balls.some((ball) => ball.rigidBody.mesh.name === this.myUser.getID().value);
        if (!loaded) {
            const ball = this.placeBall(current);
            ball.rigidBody.onFreeze.push(this.onNextPlayer);
        }

        if (current.getID().value === this.myUser.getID().value) {
            this.club.showDirectionGizmo();
        }
    }

    // public loadCourse(course: Course): void {
    //     course.tiles.values().forEach((tile) => {
    //         this.world.addBody(tile.rigidBody);
    //         this.world.sceneWrapper.scene.add(tile.rigidBody.mesh);
    //     })
    // }

    // public unloadCourse(course: Course): void {
    //     course.tiles.values().forEach((tile) => {
    //         this.world.removeBody(tile.rigidBody);
    //         this.world.sceneWrapper.scene.remove(tile.rigidBody.mesh);
    //     })
    // }

    private onNextPlayer = () => {
        if (this.balls.some((ball) => ball.rigidBody.isMoving())) return;
        
        this.nextPlayer();
    }
}