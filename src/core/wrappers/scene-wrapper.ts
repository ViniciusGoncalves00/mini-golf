import * as THREE from "three";
import { Monobehavior } from "../monobehavior";
import { Color } from "../common/enums";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export class SceneWrapper extends Monobehavior {
    public readonly scene: THREE.Scene;

    public readonly canvas: HTMLElement;
    public readonly renderer: THREE.WebGLRenderer;
    public readonly labelRenderer: CSS2DRenderer;

    public readonly globalLight: THREE.DirectionalLight;
    public readonly hemisphereLight: THREE.HemisphereLight;
    public readonly ambientLight: THREE.AmbientLight;

    public readonly globalLightHelper: THREE.DirectionalLightHelper;

    public readonly fog: THREE.FogExp2;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly ground: THREE.Mesh;
    private readonly grid: THREE.Mesh;

    public constructor(canvas: HTMLElement, camera: THREE.PerspectiveCamera) {
        super();

        this.canvas = canvas;
        this.camera = camera;
        this.camera.layers.enable(0);
        this.camera.layers.disable(2);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xeeeeee);

        this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
        this.renderer.setSize( this.canvas.clientWidth, this.canvas.clientHeight, false);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        window.addEventListener("resize", (e) => {
            this.resize();
        })

        this.globalLight = new THREE.DirectionalLight(Color.TEMPERATURE_NEUTRAL, 1.0);

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

        this.hemisphereLight = new THREE.HemisphereLight(Color.TEMPERATURE_WARM, Color.TEMPERATURE_COLD, 0.05);
        this.scene.add(this.hemisphereLight);

        this.globalLightHelper = new THREE.DirectionalLightHelper(this.globalLight, 10, 0xff0000);
        this.globalLightHelper.visible = false;
        this.scene.add(this.globalLightHelper)

        this.ambientLight = new THREE.AmbientLight(Color.TEMPERATURE_WARM, 0.05);
        this.scene.add(this.ambientLight);

        this.grid = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 100, 100), new THREE.MeshBasicMaterial({ color: 0xeeeeee, wireframe: true }));
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

        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        document.body.appendChild(this.labelRenderer.domElement);
        this.labelRenderer.domElement.className = "fixed top-0 pointer-events-none";
    }

    public update(delta: number): void {
        this.globalLightHelper.update();
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }

    public resize(): void {
        this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.renderer.setSize( this.canvas.clientWidth, this.canvas.clientHeight, false);
        this.labelRenderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.camera.updateProjectionMatrix();
    }
}