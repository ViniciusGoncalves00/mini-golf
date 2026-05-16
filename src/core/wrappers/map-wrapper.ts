import * as THREE from "three";
import { Monobehavior } from "../monobehavior";

export class MapWrapper extends Monobehavior {
    public readonly scene: THREE.Scene;
    public readonly renderer: THREE.WebGLRenderer;
    public readonly camera: THREE.OrthographicCamera;

    public constructor(scene: THREE.Scene, canvas: HTMLElement) {
        super();

        this.scene = scene;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        const aspect = width / height;
        const frustum = 100;

        this.camera = new THREE.OrthographicCamera(
            -frustum * aspect,
             frustum * aspect,
             frustum,
            -frustum,
             0.1,
             10000
        );
        this.camera.layers.enable(0);
        this.camera.layers.enable(2);

        
        this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    }

    public update(delta: number): void {
        this.renderer.render(this.scene, this.camera);
    }

    public resize(): void {
        const canvas = this.renderer.domElement;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        if (width <= 0 || height <= 0) return;

        const aspect = width / height;
        const frustum = 100;

        this.camera.left = -frustum * aspect;
        this.camera.right = frustum * aspect;
        this.camera.top = frustum;
        this.camera.bottom = -frustum;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height, false);
    }

    public centralize(objects: THREE.Object3D[]): void {
        if (objects.length === 0) return;

        const box = new THREE.Box3();

        for (const object of objects) {
            box.expandByObject(object);
        }

        if (box.isEmpty()) return;

        const center = new THREE.Vector3();
        const size = new THREE.Vector3();

        box.getCenter(center);
        box.getSize(size);

        const offset = 1.2;

        const object_width = size.x;
        const object_height = size.y;

        const frustum_width = this.camera.right - this.camera.left;
        const frustum_height = this.camera.top - this.camera.bottom;

        const zoom_x = frustum_width / (object_width * offset);
        const zoom_y = frustum_height / (object_height * offset);

        this.camera.zoom = Math.min(zoom_x / 1, zoom_y / 1);
        this.camera.position.set(center.x, center.y + 100, center.z)
        this.camera.lookAt(center);

        this.camera.updateProjectionMatrix();
    }
}