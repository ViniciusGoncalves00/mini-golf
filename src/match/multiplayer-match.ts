import { Course } from "./course";
import { Player } from "./player";
import { Match } from "./match";

/**
 * Class to handle only with all match logic (world/scene, players, ui).
 */
export class MultiPlayerMatch extends Match {
    public readonly players: Player[] = [];

    public currentPlayer: Player | null = null;
    public turnIndex: number = -1;
    
    public constructor(canvas: HTMLElement, courses: Course[], players: Player[]) {
        super(canvas, courses);

        this.players = players;
        this.nextPlayer();
    }

    public nextCourse(): void {
        super.nextCourse();

        this.currentPlayer = null;
        this.turnIndex = -1;
    }

    public nextPlayer(): void {
        const current = this.currentPlayer;

        if (current) {
            const callbacks = current.ball.rigidBody.onFreeze;

            const index = callbacks.findIndex(cb => cb === this.onNextPlayer);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }

            current.ball.rigidBody.disable();
        }

        this.turnIndex++;
        if (this.turnIndex >= this.players.length) this.turnIndex = 0;
        this.currentPlayer = this.players[this.turnIndex];

        const player = this.currentPlayer;

        player.ball.rigidBody.onFreeze.push(this.onNextPlayer);
        player.ball.rigidBody.enable();
        player.club.showDirectionGizmo();
        player.ball.onDisable.push(() => player.club.hideDirectionGizmo())

        if (!player.isLoaded) {
            this.loadPlayer(player);
        }
    }

    public loadCourse(course: Course): void {
        course.tiles.values().forEach((tile) => {
            this.world.addBody(tile.rigidBody);
            this.world.sceneWrapper.scene.add(tile.rigidBody.mesh);
        })
    }

    public unloadCourse(course: Course): void {
        course.tiles.values().forEach((tile) => {
            this.world.removeBody(tile.rigidBody);
            this.world.sceneWrapper.scene.remove(tile.rigidBody.mesh);
        })
    }

    private onNextPlayer = () => {
        this.nextPlayer();
    }
}