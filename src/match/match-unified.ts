import * as THREE from "three";
import { Course } from "./course";
import { Player } from "./player";
import { World } from "./world";
import { Global } from "./global";
import { Monobehavior } from "../monobehavior";

/**
 * Class to handle only with all match logic (world/scene, players, ui).
 */
export class MatchUnified {
    public readonly players: Player[] = [];
    public readonly courses: Course[] = [];
    public readonly world: World;

    protected currentCourse: Course | null = null;
    protected currentCourseIndex: number = -1;

    protected readonly monobehaviors: Monobehavior[] = [];

    private readonly timer: THREE.Timer = new THREE.Timer();
    private frame: number = 0;
    
    public constructor(canvas: HTMLElement, courses: Course[], players: Player[], handler: () => void) {
        this.world = new World(canvas);

        this.courses = courses;
        this.players = players;

        this.players.forEach(player => {
            player.ball.rigidBody.onFreeze.push(handler);
        });
        
        this.nextCourse();
    }

    public start(): void {
        this.animate();
    }

    public pause(): void {
        cancelAnimationFrame(this.frame);
    }

    public unpause(): void {
        this.animate();
    }

    public stop(): void {
        cancelAnimationFrame(this.frame);
    }

    public nextCourse(): void {
        this.currentCourseIndex++;

        if (this.currentCourse) this.unloadCourse(this.currentCourse);

        this.currentCourse = this.courses[this.currentCourseIndex];
        this.loadCourse(this.currentCourse);
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

    protected loadPlayer(player: Player): void {
        player.isLoaded = true;

        this.monobehaviors.push(player.ball);
        this.monobehaviors.push(player.club);

        this.world.addBody(player.ball.rigidBody);
        this.world.sceneWrapper.scene.add(player.ball.arrow);
        this.world.sceneWrapper.scene.add(player.ball.safePositionDebug);
        this.world.sceneWrapper.scene.add(player.ball.colliderDebug);
        this.world.sceneWrapper.scene.add(player.club.arrow);

        player.ball.rigidBody.mesh.position.set(1, 1, 0);
    }

    protected unloadPlayer(player: Player): void {
        player.isLoaded = false;

        var index = this.monobehaviors.findIndex(obj => obj == player.ball);
        this.monobehaviors.splice(index, 1);

        var index = this.monobehaviors.findIndex(obj => obj == player.club);
        this.monobehaviors.splice(index, 1);

        this.world.removeBody(player.ball.rigidBody);
        this.world.sceneWrapper.scene.remove(player.ball.arrow);
        this.world.sceneWrapper.scene.remove(player.ball.safePositionDebug);
        this.world.sceneWrapper.scene.remove(player.ball.colliderDebug);
        this.world.sceneWrapper.scene.remove(player.club.arrow);
    }

    private animate = () => {
        this.frame = requestAnimationFrame(this.animate);

        this.timer.update();
        const delta = this.timer.getDelta() * Global.timeScale;

        for (const monobehavior of this.monobehaviors) monobehavior.update(delta);
        this.world.update(delta);
    }
}