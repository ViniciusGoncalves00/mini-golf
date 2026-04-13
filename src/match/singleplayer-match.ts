import { Course } from "./course";
import { Player } from "./player";
import { Match } from "./match";

/**
 * Class to handle only with all match logic (world/scene, players, ui).
 */
export class SinglePlayerMatch extends Match {
    public readonly player: Player;
    
    public constructor(canvas: HTMLElement, courses: Course[], player: Player) {
        super(canvas, courses);

        this.player = player;

        player.club.hideDirectionGizmo();
        player.ball.rigidBody.onFreeze.push(() => player.club.showDirectionGizmo());
        player.ball.rigidBody.onUnfreeze.push(() => player.club.hideDirectionGizmo());

        this.loadPlayer(player);
    }
}