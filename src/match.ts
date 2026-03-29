import * as THREE from "three";
import { Course } from "./course";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { User } from "./user";
import { Player } from "./player";
import { Global } from "./global";
import { Builder } from "./builder";

export class Match {
    public readonly players: Player[];
    public readonly courses: Course[];
    
    public currentPlayer: Player | null = null;
    public turnIndex: number = -1;
    
    private currentCourse: Course | null = null;
    private currentCourseIndex: number = -1;

    public renderer!: THREE.WebGLRenderer;
    public scene!: THREE.Scene;
    public camera!: THREE.PerspectiveCamera;
    public orbitControls!: OrbitControls;
    public globalLight!: THREE.DirectionalLight;
    public globalLightHelper!: THREE.DirectionalLightHelper;
    public ambientLight!: THREE.AmbientLight;

    private timer: THREE.Timer = new THREE.Timer();

    public constructor(users: User[], courses: Course[]) {
        this.createScene();

        this.players = users.map((user) => new Player(user, this.renderer.domElement));
        this.courses = courses;

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
            this.scene.add(this.currentPlayer.ball.mesh);
            this.scene.add(this.currentPlayer.ball.arrow);
            this.scene.add(this.currentPlayer.club.arrow);

            this.currentPlayer.ball.mesh.position.set(0, 1, 0);

            this.renderer.domElement.addEventListener("mousemove", (e) => {
                this.currentPlayer?.club.calculateDirection(this.camera, e, this.renderer.domElement.getBoundingClientRect(), this.currentPlayer?.ball)
            })

            this.renderer.domElement.addEventListener("mousemove", (e) => {
                this.currentPlayer?.club.startShot();
            })

            this.renderer.domElement.addEventListener("mousemove", (e) => {
                this.currentPlayer?.club.freeShot();
            })
        }
    }

    private createScene(): void {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0.98, 0.98, 0.98);
        this.camera = new THREE.PerspectiveCamera(
          55,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );

        this.camera.position.set(0, 1, -2);

        const canvas = document.getElementById("game")!;
        this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        document.body.appendChild(this.renderer.domElement);

        this.globalLight = new THREE.DirectionalLight(0xffffff, 0.8);

        this.globalLight.position.set(100, 75, 100);
        this.globalLight.castShadow = true;

        this.globalLight.target.position.set(0, 0, 0);
        this.scene.add(this.globalLight.target);

        this.globalLight.shadow.mapSize.set(16_384, 16_384);

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
        this.orbitControls.enablePan = false;
    }

    private animate = () => {
        requestAnimationFrame(this.animate);
    
        this.globalLightHelper.update()
    
        this.timer.update();
        const delta = this.timer.getDelta() * Global.timeScale;
    
        for (const monobehavior of Builder.monobehaviors) monobehavior.update(delta);

        const player = this.currentPlayer;
        if (!player) return;
    
        const direction = new THREE.Vector3().subVectors(player.camera.position, player.ball.mesh.position).normalize();
        
        const distance = player.ball.mesh.position.distanceTo(player.camera.position);
        this.camera.position.copy(direction.multiplyScalar(distance).add(player.ball.mesh.position));
        this.orbitControls.target.copy(player.ball.mesh.position);
        this.orbitControls.update();
    
        this.renderer.render(this.scene, this.camera);
    
        if (player.ball.rigidBody.canInteract()) {
            player.club.showArrow();
            // const tile = course.tryGetTile({x: 0, y: 0, z: rows - 2});
            // if (tile) {
            //     const box = new THREE.Box3(
            //         new THREE.Vector3(-(tile.width / 2), 0          , ((rows - 2) * tile.length) - (tile.length / 2)),
            //         new THREE.Vector3( (tile.width / 2), 10000000000, ((rows - 2) * tile.length) + (tile.length / 2)),
            //     )
    
            //     if (box.containsPoint(ball.mesh.position)) {
            //         tile.setColor(0x0000aa);
            //     } else {
            //         tile.setColor(0xaa0000);
            //     }
            // }
        } else {
            player.club.hideArrow();
        }
        
        // if ((Date.now() - lastCollision) < collisionCheckInterval) return;
    
        // calculateWallCollision(delta);
        // applyGravity(delta);
        // calculateCollision(delta);
        // ball.rigidBody.applyDrag(World.airDrag * delta);
        // ball.rigidBody.applyForce(World.windDirection.clone().multiplyScalar(World.windSpeed * delta))
    }
}