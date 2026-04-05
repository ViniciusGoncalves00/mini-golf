import * as THREE from "three";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { StorageKey, Tile } from "./common/enums";
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

    public async loadSTL(): Promise<void> {
        const fileNames = Object.values(Tile);
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

    public load(key: StorageKey): any {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }

    public save(key: string, data: any): void {
        localStorage.setItem(key, JSON.stringify(data));
    }
}