import * as THREE from "three";
import { Builder } from "../builder";
import { Monobehavior } from "../monobehavior";
import { User } from "../user";
import { World } from "./world";
import { Ball } from "./ball";
import { Club } from "./club";
import { Global } from "./global";
import { Course } from "../course/course";

export abstract class Match {
    public readonly courses: Course[] = [];
    public readonly world: World;
    public readonly users: User[] = [];
    
    protected currentCourse: Course | null = null;
    protected currentCourseIndex: number = -1;
    
    protected readonly balls: Ball[] = [];
    protected readonly monobehaviors: Monobehavior[] = [];
    protected readonly club: Club = new Club();

    private readonly timer: THREE.Timer = new THREE.Timer();
    private frame: number = 0;
    
    public constructor(canvas: HTMLElement, courses: Course[], users: User[]) {
        this.world = new World(canvas);
        this.world.sceneWrapper.scene.add(this.club.arrow);
        this.club.disable();

        this.courses = courses;
        this.users = users;

        this.monobehaviors.push(this.club);
        
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

    protected placeBall(user: User): Ball {
        const ball = Builder.ball(user.getID().value);
        this.balls.push(ball);
        
        this.monobehaviors.push(ball);

        this.world.addBody(ball.rigidBody);
        this.world.sceneWrapper.scene.add(ball.arrow);
        this.world.sceneWrapper.scene.add(ball.safePositionDebug);
        this.world.sceneWrapper.scene.add(ball.colliderDebug);

        ball.rigidBody.mesh.position.set(1, 1, 0);
        return ball;
    }

    protected removeBall(user: User): void {
        var index = this.balls.findIndex((b) => b.rigidBody.mesh.name === user.getID().value);
        const [ball] = this.balls.splice(index, 1);

        var index = this.monobehaviors.findIndex(obj => obj == ball);
        this.monobehaviors.splice(index, 1);

        this.world.removeBody(ball.rigidBody);
        this.world.sceneWrapper.scene.remove(ball.arrow);
        this.world.sceneWrapper.scene.remove(ball.safePositionDebug);
        this.world.sceneWrapper.scene.remove(ball.colliderDebug);
    }

    private animate = () => {
        this.frame = requestAnimationFrame(this.animate);

        this.timer.update();
        const delta = this.timer.getDelta() * Global.timeScale;

        for (const monobehavior of this.monobehaviors) monobehavior.update(delta);
        this.world.update(delta);
    }
}