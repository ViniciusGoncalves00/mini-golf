import * as THREE from "three";
import { Course } from "./course";
import { Player } from "./player";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export class Match {
    public readonly players: Player[] = [];
    public readonly courses: Course[];
    
    private currentCourse: Course | null = null;
    private currentCourseIndex: number = -1;

    public renderer!: THREE.WebGLRenderer;
    public scene!: THREE.Scene;
    public camera!: THREE.PerspectiveCamera;
    public orbitControls!: OrbitControls;
    public globalLight!: THREE.DirectionalLight;
    public globalLightHelper!: THREE.DirectionalLightHelper;
    public ambientLight!: THREE.AmbientLight;

    public constructor(courses: Course[]) {
        this.courses = courses;

        this.createScene();
    }

    public nextCourse(): void {
        this.currentCourseIndex++;

        this.currentCourse?.dispose();
        this.currentCourse = this.courses[this.currentCourseIndex];
        this.currentCourse.load();
        this.currentCourse.tiles.values().forEach((tile) => {
            this.scene.add(tile.mesh);
        })
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

        const canvas = document.getElementById("MyCanvas")!;
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

        // renderer.domElement.addEventListener("mousemove", (e) => {
        //     club.calculateDirection(this.camera, e, renderer.domElement.getBoundingClientRect(), ball)
        // })

        // renderer.domElement.addEventListener("mousedown", (e) => {
        //     club.startShot();
        // })
        
        // renderer.domElement.addEventListener("mouseup", (e) => {
        //     club.freeShot();
        // })
    }
}