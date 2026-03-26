import * as THREE from "three";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
const base = import.meta.url;

export class StorageManager {
    private static instance: StorageManager | null = null;

    public geometries: Map<string, THREE.BufferGeometry> = new Map();

    private constructor() {}

    public static getInstance(): StorageManager {
        if (!this.instance) {
            this.instance = new StorageManager();
        }
        return this.instance;
    }

    public static async init(): Promise<StorageManager> {
        if (!this.instance) {
            this.instance = new StorageManager();
            await this.instance.loadGeometries();
        }
        return this.instance;
    }

    private async loadGeometries() {
        const fileNames = [
            "plane_corner",
            "plane_hole",
            "plane_parallel",
            "plane_u",
            "plane_wall",
            "plane",
        ];

        const loader = new STLLoader();

        for (const fileName of fileNames) {
            const url = new URL(`../static/geometry/${fileName}.stl`, base);
            const geometry = await loader.loadAsync(
                url.href,
                function (xhr) {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
            );
            geometry.rotateX(-Math.PI / 2);
            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();
            geometry.computeVertexNormals();
            this.geometries.set(fileName, geometry);
        }
    }
}