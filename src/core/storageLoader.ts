import * as THREE from "three";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { StorageKey, Geometries, Textures, GeometriesGLB } from "./common/enums";
import { BufferGeometryUtils, GLTFLoader } from "three/examples/jsm/Addons.js";
const base = import.meta.env.BASE_URL;

export class StorageLoader {
    private static _instance: StorageLoader | null = null;

    public geometries: Map<string, THREE.BufferGeometry> = new Map();
    public textures: Map<string, THREE.Texture> = new Map();

    private constructor() {}

    public static instance(): StorageLoader {
        if (!this._instance) {
            this._instance = new StorageLoader();
        }
        return this._instance;
    }

    public async loadGLTF(): Promise<void> {
        const loader = new GLTFLoader();
        const fileNames = Object.values(GeometriesGLB);

        for (const fileName of fileNames) {
            const url = `${base}geometry/${fileName}.glb`;
            const gltf = await loader.loadAsync(
                url,
                function (xhr) {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
            );
            const geometries: THREE.BufferGeometry[] = [];

            gltf.scene.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    geometries.push((child as THREE.Mesh).geometry);
                }
            });
            
            const merged = BufferGeometryUtils.mergeGeometries(geometries);
            this.geometries.set(fileName, merged);
        }
        return;
    }

    public async loadSTL(): Promise<void> {
        const loader = new STLLoader();
        const fileNames = Object.values(Geometries);
        
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

            const box = geometry.boundingBox!;
            const size = new THREE.Vector3();
            box.getSize(size);

            const pos = geometry.attributes.position;
            const normal = geometry.attributes.normal;

            const uv = [];

            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i);
                const y = pos.getY(i);
                const z = pos.getZ(i);
            
                const nx = Math.abs(normal.getX(i));
                const ny = Math.abs(normal.getY(i));
                const nz = Math.abs(normal.getZ(i));
            
                let u, v;
            
                if (nx > ny && nx > nz) {
                    u = (y - box.min.y) / size.y;
                    v = (z - box.min.z) / size.z;
                } else if (ny > nz) {
                    u = (x - box.min.x) / size.x;
                    v = (z - box.min.z) / size.z;
                } else {
                    u = (x - box.min.x) / size.x;
                    v = (y - box.min.y) / size.y;
                }
            
                uv.push(u, v);
            }

            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));

            this.geometries.set(fileName, geometry);
        }
    }

    public async loadTextures(): Promise<void> {
        const loader = new THREE.TextureLoader();
        const fileNames = Object.values(Textures);
        
        for (const fileName of fileNames) {
            const url = `${base}textures/${fileName}.jpg`;
            const texture = await loader.loadAsync(
                url,
                function (xhr) {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
            );
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            this.textures.set(fileName, texture);
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