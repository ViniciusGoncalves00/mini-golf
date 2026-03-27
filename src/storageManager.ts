import * as THREE from "three";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { Tiles } from "./enums";
const base = import.meta.env.BASE_URL;

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
        const fileNames = Object.values(Tiles);
        const loader = new STLLoader();
        

        for (const fileName of fileNames) {
            const url = `${base}geometry/${fileName}.stl`;
            const geometry = await loader.loadAsync(
                url,
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