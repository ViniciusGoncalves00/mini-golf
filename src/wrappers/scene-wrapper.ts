import * as THREE from "three";
import { Monobehavior } from "../monobehavior";

export class SceneWrapper extends Monobehavior {
    public scene: THREE.Scene;
    public renderer: THREE.WebGLRenderer;
    public globalLight: THREE.DirectionalLight;
    public globalLightHelper: THREE.DirectionalLightHelper;
    public ambientLight: THREE.AmbientLight;

    private readonly camera: THREE.Camera;

    public constructor(canvas: HTMLElement, camera: THREE.Camera) {
        super();

        this.camera = camera;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0.98, 0.98, 0.98);

        this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

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
    }

    public update(delta: number): void {
        this.globalLightHelper.update();
        this.renderer.render(this.scene, this.camera);
    }
}