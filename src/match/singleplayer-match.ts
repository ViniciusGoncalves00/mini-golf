import { Course } from "./course";
import { Player } from "./player";
import { Match } from "./match";
import { CameraType } from "../common/enums";

export class SinglePlayerMatch extends Match {
    public readonly player: Player;
    
    public constructor(canvas: HTMLElement, courses: Course[], player: Player) {
        super(canvas, courses);

        this.player = player;

        player.club.hideDirectionGizmo();
        player.ball.rigidBody.onFreeze.push(() => player.club.showDirectionGizmo());
        player.ball.rigidBody.onUnfreeze.push(() => player.club.hideDirectionGizmo());

        player.club.onFreeShot.push((force) => {
            player.ball.rigidBody.unfreeze();
            player.ball.rigidBody.applyForce(force);
            player.club.hideDirectionGizmo();
        })

        this.world.sceneWrapper.renderer.domElement.addEventListener("mousemove", (e) => {
            player.club.calculateDirection(this.world.cameraWrapper.camera, e, this.world.sceneWrapper.renderer.domElement.getBoundingClientRect(), player.ball)
        })

        this.world.sceneWrapper.renderer.domElement.addEventListener("mousedown", (e) => {
            if (e.button == 2) player.club.startShot();
        })

        this.world.sceneWrapper.renderer.domElement.addEventListener("mouseup", (e) => {
            if (e.button == 2) player.club.freeShot();
        })

        this.world.cameraWrapper.setTargetMode(player.ball.rigidBody);
        document.addEventListener("keypress", (e) => {
            if (e.key === "t") {
                if (this.world.cameraWrapper.cameraMode === CameraType.FREE) {
                    this.world.cameraWrapper.setTargetMode(player.ball.rigidBody);
                } else if (this.world.cameraWrapper.cameraMode === CameraType.TARGET) {
                    this.world.cameraWrapper.setFreeMode();
                }
            }
        })

        this.loadPlayer(player);
    }
}