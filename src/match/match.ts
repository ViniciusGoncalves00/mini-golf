import { Course } from "./course";
import { Player } from "./player";
import { World } from "./world";

/**
 * Class to handle only with all match logic (world/scene, players, ui).
 */
export class Match {
    public readonly player: Player;
    public readonly players: Player[] = [];
    public readonly courses: Course[] = [];

    public currentPlayer: Player | null = null;
    public turnIndex: number = -1;
    
    private currentCourse: Course | null = null;
    private currentCourseIndex: number = -1;

    private readonly world: World;
    
    public constructor(canvas: HTMLElement, player: Player, players: Player[], courses: Course[]) {
        this.world = new World(canvas);

        this.player = player;
        this.players = players;
        this.courses = courses;
        
        this.nextCourse();
        this.nextPlayer();
    }

    public nextCourse(): void {
        this.currentCourseIndex++;

        if (this.currentCourse) this.unload(this.currentCourse);

        this.currentCourse = this.courses[this.currentCourseIndex];
        this.load(this.currentCourse);

        this.currentPlayer = null;
        this.turnIndex = -1;
    }

    public nextPlayer(): void {
        this.turnIndex >= this.players.length ? this.turnIndex = 0 : this.turnIndex++;

        this.currentPlayer = this.players[this.turnIndex];
        const player = this.currentPlayer;

        if (!player.ball.isLoaded) {
            player.ball.isLoaded = true;

            this.place(player);

            this.world.sceneWrapper.renderer.domElement.addEventListener("mousemove", (e) => {
                player?.club.calculateDirection(this.world.cameraWrapper.camera, e, this.world.sceneWrapper.renderer.domElement.getBoundingClientRect(), player?.ball)
            })

            this.world.sceneWrapper.renderer.domElement.addEventListener("mousedown", (e) => {
                if (e.button == 2) player?.club.startShot();
            })

            this.world.sceneWrapper.renderer.domElement.addEventListener("mouseup", (e) => {
                if (e.button == 2) player?.club.freeShot();
            })
        }
    }

    public load(course: Course): void {
        course.tiles.values().forEach((tile) => {
            this.world.addBody(tile.rigidBody);
            this.world.sceneWrapper.scene.add(tile.rigidBody.mesh);
        })
    }

    public unload(course: Course): void {
        course.tiles.values().forEach((tile) => {
            this.world.removeBody(tile.rigidBody);
            this.world.sceneWrapper.scene.remove(tile.rigidBody.mesh);
        })
    }

    public insideHole(): boolean { return false }

    public place(player: Player): void {
        this.world.addBody(player.ball.rigidBody);

        this.world.sceneWrapper.scene.add(player.ball.rigidBody.mesh);
        this.world.sceneWrapper.scene.add(player.ball.arrow);
        this.world.sceneWrapper.scene.add(player.ball.safePositionDebug);
        this.world.sceneWrapper.scene.add(player.ball.colliderDebug);
        this.world.sceneWrapper.scene.add(player.club.arrow);

        player.ball.rigidBody.mesh.position.set(1, 1, 0);
    }

    public collect(player: Player): void {
        this.world.removeBody(player.ball.rigidBody);

        this.world.sceneWrapper.scene.remove(player.ball.rigidBody.mesh);
        this.world.sceneWrapper.scene.remove(player.ball.arrow);
        this.world.sceneWrapper.scene.remove(player.ball.safePositionDebug);
        this.world.sceneWrapper.scene.remove(player.ball.colliderDebug);
        this.world.sceneWrapper.scene.remove(player.club.arrow);
    }
}