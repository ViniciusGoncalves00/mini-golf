import * as THREE from "three";
import { Course } from "./course";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { User } from "./user";
import { Player } from "./player";
import { Global } from "./global";
import { Builder } from "./builder";
import { Ball } from "./ball";
import { World } from "./physics/world";
import { degToRad, radToDeg } from "three/src/math/MathUtils.js";

// export class Match {
//     public readonly players: Player[];
//     public readonly courses: Course[];
    
//     public currentPlayer: Player | null = null;
//     public turnIndex: number = -1;
    
//     private currentCourse: Course | null = null;
//     private currentCourseIndex: number = -1;

//     public renderer!: THREE.WebGLRenderer;
//     public scene!: THREE.Scene;
//     public camera!: THREE.PerspectiveCamera;
//     public orbitControls!: OrbitControls;
//     public globalLight!: THREE.DirectionalLight;
//     public globalLightHelper!: THREE.DirectionalLightHelper;
//     public ambientLight!: THREE.AmbientLight;

//     private timer: THREE.Timer = new THREE.Timer();

//     public constructor(users: User[], courses: Course[]) {
//         this.createScene();

//         this.players = users.map((user) => new Player(user));
//         this.courses = courses;

//         this.nextCourse();

//         this.animate();
//     }

//     public nextCourse(): void {
//         this.currentCourseIndex++;

//         this.currentCourse?.dispose();
//         this.currentCourse = this.courses[this.currentCourseIndex];
//         this.currentCourse.load();
//         this.currentCourse.tiles.values().forEach((tile) => {
//             this.scene.add(tile.mesh);
//         })

//         this.currentPlayer = null;
//         this.turnIndex = -1;
//         this.players.forEach(player => {
//             this.scene.remove(player.ball.mesh);
//             this.scene.remove(player.ball.arrow);
//             this.scene.remove(player.club.arrow);
//         })
//         this.nextPlayer();
//     }

//     public nextPlayer(): void {
//         this.turnIndex >= this.players.length ? this.turnIndex = 0 : this.turnIndex++;

//         this.currentPlayer = this.players[this.turnIndex];

//         if (!this.currentPlayer.ball.isLoaded) {
//             this.scene.add(this.currentPlayer.ball.mesh);
//             this.scene.add(this.currentPlayer.ball.arrow);
//             this.scene.add(this.currentPlayer.club.arrow);

//             this.currentPlayer.ball.mesh.position.set(0, 1, 0);

//             this.renderer.domElement.addEventListener("mousemove", (e) => {
//                 this.currentPlayer?.club.calculateDirection(this.camera, e, this.renderer.domElement.getBoundingClientRect(), this.currentPlayer?.ball)
//             })

//             this.renderer.domElement.addEventListener("mousemove", (e) => {
//                 this.currentPlayer?.club.startShot();
//             })

//             this.renderer.domElement.addEventListener("mousemove", (e) => {
//                 this.currentPlayer?.club.freeShot();
//             })
//         }
//     }

//     private createScene(): void {
//         this.scene = new THREE.Scene();
//         this.scene.background = new THREE.Color(0.98, 0.98, 0.98);
//         this.camera = new THREE.PerspectiveCamera(
//           55,
//           window.innerWidth / window.innerHeight,
//           0.1,
//           1000
//         );

//         this.camera.position.set(0, 1, -2);

//         const canvas = document.getElementById("game")!;
//         this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
//         this.renderer.setSize(window.innerWidth, window.innerHeight);
//         this.renderer.shadowMap.enabled = true;
//         this.renderer.shadowMap.type = THREE.PCFShadowMap;

//         document.body.appendChild(this.renderer.domElement);

//         this.globalLight = new THREE.DirectionalLight(0xffffff, 0.8);

//         this.globalLight.position.set(100, 75, 100);
//         this.globalLight.castShadow = true;

//         this.globalLight.target.position.set(0, 0, 0);
//         this.scene.add(this.globalLight.target);

//         this.globalLight.shadow.mapSize.set(16_384, 16_384);

//         this.globalLight.shadow.camera.left = -10;
//         this.globalLight.shadow.camera.right = 10;
//         this.globalLight.shadow.camera.top = 10;
//         this.globalLight.shadow.camera.bottom = -10;

//         this.globalLight.shadow.camera.near = 0.01;
//         this.globalLight.shadow.camera.far = 2000;

//         this.globalLight.shadow.bias = 0.00000001;
//         this.globalLight.shadow.normalBias = 0.0001;
//         this.globalLight.shadow.radius = 1;

//         this.scene.add(this.globalLight);

//         this.globalLightHelper = new THREE.DirectionalLightHelper(this.globalLight, 10, 0xff0000);
//         this.scene.add(this.globalLightHelper)

//         this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
//         this.scene.add(this.ambientLight);

//         this.orbitControls = new OrbitControls( this.camera, this.renderer.domElement );
//         this.orbitControls.enablePan = false;
//     }

//     private animate = () => {
//         requestAnimationFrame(this.animate);

//         this.globalLightHelper.update();
    
//         this.timer.update();
//         const delta = this.timer.getDelta() * Global.timeScale;
    
//         for (const monobehavior of Builder.monobehaviors) monobehavior.update(delta);

//         for (const player of this.players) {
    
//         const direction = new THREE.Vector3().subVectors(player.camera.position, player.ball.mesh.position).normalize();
        
//         const distance = player.ball.mesh.position.distanceTo(player.camera.position);
//         this.camera.position.copy(direction.multiplyScalar(distance).add(player.ball.mesh.position));
//         this.orbitControls.target.copy(player.ball.mesh.position);
//         this.orbitControls.update();
        
//         this.renderer.render(this.scene, player.camera);
    
//         if (player.ball.rigidBody.canInteract()) {
//             player.club.showArrow();
//             // const tile = course.tryGetTile({x: 0, y: 0, z: rows - 2});
//             // if (tile) {
//             //     const box = new THREE.Box3(
//             //         new THREE.Vector3(-(tile.width / 2), 0          , ((rows - 2) * tile.length) - (tile.length / 2)),
//             //         new THREE.Vector3( (tile.width / 2), 10000000000, ((rows - 2) * tile.length) + (tile.length / 2)),
//             //     )
    
//             //     if (box.containsPoint(ball.mesh.position)) {
//             //         tile.setColor(0x0000aa);
//             //     } else {
//             //         tile.setColor(0xaa0000);
//             //     }
//             // }
//         } else {
//             player.club.hideArrow();
//         }
        
//         // if ((Date.now() - lastCollision) < collisionCheckInterval) return;
    
//         // calculateWallCollision(delta);
//         const isGrounded = false;
//         applyGravity(delta, player.ball, this.currentCourse!, isGrounded);
//         calculateCollision(delta, player.ball, this.currentCourse!, isGrounded);
//         // ball.rigidBody.applyDrag(World.airDrag * delta);
//         // ball.rigidBody.applyForce(World.windDirection.clone().multiplyScalar(World.windSpeed * delta))
//         }
//     }
// }

function applyGravity(delta: number, ball: Ball, course: Course): boolean {
    const raycaster = new THREE.Raycaster();
    const down = new THREE.Vector3(0, -1, 0);

    raycaster.set(ball.mesh.position, down);
    raycaster.far = ball.radius;

    const intersections = raycaster.intersectObjects(course.tiles.values().toArray().map(t => t.mesh));
    const hit = intersections.find(i => i.object.uuid !== ball.mesh.uuid);

    const distance = World.gravity.length() + ball.radius;
    
    let isGrounded = false;
    if (hit && hit.distance < ball.radius * 1.1) {
        isGrounded = true;
    } else {
        isGrounded = false;
    }

    if (isGrounded && ball.rigidBody.getSpeed() < 0.1) {
        ball.rigidBody.stop();
    }

    if (!hit || hit.distance > ball.radius * 1.1) {
        ball.rigidBody.applyForce(World.gravity.clone().multiplyScalar(delta));
    }

    return isGrounded;
}

function calculateCollision(delta: number, ball: Ball, course: Course, isGrounded: boolean) {
    if (!ball.rigidBody.isMoving()) return;

    const raycaster = new THREE.Raycaster();
    const forward = new THREE.Vector3();

    if (isGrounded) {
        raycaster.set(ball.mesh.position, new THREE.Vector3(0, -1, 0));
        const intersections = raycaster.intersectObjects(course.tiles.values().toArray().map(t => t.mesh));
        const hit2 = intersections.find(i => i.object.uuid !== ball.mesh.uuid);
        if (!hit2) return;

        const tile2 = course.tiles.values().toArray().find(tile => tile.mesh.uuid === hit2.object.uuid);
        if (!tile2) return;

        ball.rigidBody.applyDrag(tile2.friction * delta);
    }
    
    forward.copy(ball.rigidBody.getDirection());
    raycaster.set(ball.mesh.position, forward);
    const intersections = raycaster.intersectObjects(course.tiles.values().toArray().map(t => t.mesh));

    if (intersections.length === 0) return;
    
    const hit = intersections.find(i => i.object.uuid !== ball.mesh.uuid);
    if (!hit) return;

    // colliderDebug.position.copy(hit.point)

    if (isColliding(forward, hit, ball.radius)) {
        const tile = course.tiles.values().toArray().find(tile => tile.mesh.uuid === hit.object.uuid);
        if (!tile) return;

        const normal = hit.face!.normal.clone();
        normal.transformDirection(hit.object.matrixWorld).normalize();

        const dot = forward.dot(normal);
        const impactStrength = Math.abs(dot) * tile.absorption;
        ball.rigidBody.reflect(normal, impactStrength);
    }
}

function isColliding(direction: THREE.Vector3, hit: THREE.Intersection, radius: number, threshold: number = 0.005) {
    const inverseNormal = hit.face!.normal.clone().multiplyScalar(-1);
    const angle = radToDeg(inverseNormal.angleTo(direction));

    const cossine = Math.cos(degToRad(angle));
    const hypotenuse = hit.distance;

    const adjacentSide = cossine * hypotenuse;
    const distance = adjacentSide - radius;

    const isColliding = distance < threshold;
    return isColliding;
}

export class Match2 {
    public readonly player: Player;
    public readonly players: Player[] = [];
    public readonly courses: Course[] = [];

    public currentPlayer: Player | null = null;
    public turnIndex: number = -1;
    
    private currentCourse: Course | null = null;
    private currentCourseIndex: number = -1;

    public renderer: THREE.WebGLRenderer;
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public orbitControls: OrbitControls;
    public globalLight: THREE.DirectionalLight;
    public globalLightHelper: THREE.DirectionalLightHelper;
    public ambientLight: THREE.AmbientLight;

    public canSimulate: boolean = true;

    private timer: THREE.Timer = new THREE.Timer();
    
    public constructor(player: Player, players: Player[], courses: Course[]) {
        this.player = player;
        this.players = players;
        this.courses = courses;

        this.scene = new THREE.Scene();

        this.scene.background = new THREE.Color(0.98, 0.98, 0.98);
        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1, -2);

        const canvas = document.getElementById("game")!;
        this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        document.body.appendChild(this.renderer.domElement);

        this.globalLight = new THREE.DirectionalLight(0xffffff, 0.8);

        this.globalLight.position.set(120, 75, 100);
        this.globalLight.castShadow = true;

        this.globalLight.target.position.set(0, 0, 0);
        this.scene.add(this.globalLight.target);

        this.globalLight.shadow.mapSize.set(4_096, 4_096);

        this.globalLight.shadow.camera.left = -10;
        this.globalLight.shadow.camera.right = 10;
        this.globalLight.shadow.camera.top = 10;
        this.globalLight.shadow.camera.bottom = -10;

        this.globalLight.shadow.camera.near = 0.01;
        this.globalLight.shadow.camera.far = 2000;

        this.globalLight.shadow.bias = 0.00000001;
        this.globalLight.shadow.normalBias = 0.0001;
        this.globalLight.shadow.radius = 1;

        this.scene.add(this.globalLight);

        this.globalLightHelper = new THREE.DirectionalLightHelper(this.globalLight, 10, 0xff0000);
        this.scene.add(this.globalLightHelper)

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(this.ambientLight);

        this.orbitControls = new OrbitControls( this.camera, this.renderer.domElement );
        // this.orbitControls.enablePan = false;

        this.nextCourse();

        this.animate();
    }

    public nextCourse(): void {
        this.currentCourseIndex++;

        this.currentCourse?.dispose();
        this.currentCourse = this.courses[this.currentCourseIndex];
        this.currentCourse.load();
        this.currentCourse.tiles.values().forEach((tile) => {
            this.scene.add(tile.mesh);
        })

        this.currentPlayer = null;
        this.turnIndex = -1;
        this.players.forEach(player => {
            this.scene.remove(player.ball.mesh);
            this.scene.remove(player.ball.arrow);
            this.scene.remove(player.club.arrow);
        })
        this.nextPlayer();
    }

    public nextPlayer(): void {
        this.turnIndex >= this.players.length ? this.turnIndex = 0 : this.turnIndex++;

        this.currentPlayer = this.players[this.turnIndex];

        if (!this.currentPlayer.ball.isLoaded) {
            this.currentPlayer.ball.isLoaded = true;

            this.scene.add(this.currentPlayer.ball.mesh);
            this.scene.add(this.currentPlayer.ball.arrow);
            this.scene.add(this.currentPlayer.club.arrow);

            this.currentPlayer.ball.mesh.position.set(0, 1, 0);

            this.renderer.domElement.addEventListener("mousemove", (e) => {
                this.currentPlayer?.club.calculateDirection(this.camera, e, this.renderer.domElement.getBoundingClientRect(), this.currentPlayer?.ball)
            })

            this.renderer.domElement.addEventListener("mousedown", (e) => {
                this.currentPlayer?.club.startShot();
            })

            this.renderer.domElement.addEventListener("mouseup", (e) => {
                this.currentPlayer?.club.freeShot();
            })
        }
    }

    private animate = () => {
        requestAnimationFrame(this.animate);

        this.globalLightHelper.update();
    
        this.timer.update();
        const delta = this.timer.getDelta() * Global.timeScale;
    
        for (const monobehavior of Builder.monobehaviors) monobehavior.update(delta);

        const direction = new THREE.Vector3().subVectors(this.camera.position, this.player.ball.mesh.position).normalize();
        const distance = Math.abs(this.player.ball.mesh.position.distanceTo(this.camera.position));
        const position = new THREE.Vector3().copy(direction).multiplyScalar(distance).add(this.player.ball.mesh.position)

        this.camera.position.copy(position);

        // this.orbitControls.target.copy(this.player.ball.mesh.position);
        this.orbitControls.update();
        
        this.renderer.render(this.scene, this.camera);

        if (this.player.ball.rigidBody.canInteract()) {
            this.player.club.showArrow();
        } else {
            this.player.club.hideArrow();
        }

        if (this.canSimulate) this.simulate(delta);
    }

    private simulate(delta: number): void {
        if (!this.currentCourse) return;
        
        for (const player of this.players) {
            const ball = player.ball;

            const isGrounded = applyGravity(delta, ball, this.currentCourse);
            calculateCollision(delta, ball, this.currentCourse, isGrounded);
        }
    }
}