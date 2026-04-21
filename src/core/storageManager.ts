import * as THREE from "three";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { StorageKey, Tiles } from "./common/enums";
const base = import.meta.env.BASE_URL;

export class StorageManager {
    private static _instance: StorageManager | null = null;

    public geometries: Map<string, THREE.BufferGeometry> = new Map();

    private constructor() {}

    public static instance(): StorageManager {
        if (!this._instance) {
            this._instance = new StorageManager();
        }
        return this._instance;
    }

    public async loadSTL(): Promise<void> {
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

    public load(key: StorageKey): any {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }

    public save(key: StorageKey, data: any): void {
        localStorage.setItem(key, JSON.stringify(data));
    }

    public clear(): void {
        localStorage.clear();
        window.location.reload();
    }
}