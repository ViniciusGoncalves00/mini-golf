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
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );

        this.camera.position.set(0, 15, -15);

        const canvas = document.getElementById("MyCanvas")!;
        this.renderer = new THREE.WebGLRenderer({canvas: canvas});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        document.body.appendChild(this.renderer.domElement);

        this.globalLight = new THREE.DirectionalLight();
        this.globalLight.position.set(100, 100, -100);
        this.globalLight.shadow.camera.left = -50;
this.globalLight.shadow.camera.right = 50;
this.globalLight.shadow.camera.top = 50;
this.globalLight.shadow.camera.bottom = -50;

this.globalLight.shadow.camera.near = 0.1;
this.globalLight.shadow.camera.far = 3000;
        this.globalLight.castShadow = true;
        this.globalLight.shadow!.mapSize.set(4096, 4096);
        this.globalLight.shadow!.bias = 0.0001;
        this.globalLight.shadow!.normalBias = 0.01;
        this.scene.add(this.globalLight);

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
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