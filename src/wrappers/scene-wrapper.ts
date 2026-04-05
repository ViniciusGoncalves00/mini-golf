import * as THREE from "three";
import { Monobehavior } from "../monobehavior";

export class SceneWrapper extends Monobehavior {
    public scene: THREE.Scene;
    public renderer: THREE.WebGLRenderer;
    public globalLight: THREE.DirectionalLight;
    public globalLightHelper: THREE.DirectionalLightHelper;
    public ambientLight: THREE.AmbientLight;

    private readonly ground: THREE.Mesh;
    private readonly grid: THREE.Mesh;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly fog: THREE.FogExp2;

    public constructor(canvas: HTMLElement, camera: THREE.PerspectiveCamera) {
        super();

        this.camera = camera;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xeeeeee);

        this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        window.addEventListener("resize", (e) => {
            this.resize();
        })

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
        this.globalLightHelper.visible = false;
        this.scene.add(this.globalLightHelper)

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(this.ambientLight);

        this.grid = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 100, 100), new THREE.MeshBasicMaterial({ color: 0xeeeeee, wireframe: true, transparent: true, opacity: 0.05 }));
        this.grid.rotateX(-Math.PI / 2);
        this.grid.position.set(0.5, 0, 0.5);
        this.scene.add(this.grid);

        this.ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 100, 100), new THREE.MeshPhongMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.10 }));
        this.ground.rotateX(-Math.PI / 2);
        this.ground.position.set(0.5, 0, 0.5);
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        this.fog = new THREE.FogExp2(0xeeeeee, 0.1);
        this.scene.fog = this.fog;
    }

    public update(delta: number): void {
        this.globalLightHelper.update();
        this.renderer.render(this.scene, this.camera);
    }

    public resize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.camera.updateProjectionMatrix();
    }
}