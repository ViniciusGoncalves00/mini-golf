import * as THREE from "three";
import { Tile } from "../course/tile";
import { Monobehavior } from "../monobehavior";

export class Course extends Monobehavior {
    public readonly bounds: THREE.Box3 = new THREE.Box3();
    public readonly tiles: Map<string, Tile> = new Map();

    public readonly size: number = 10;

    public constructor(tiles: Tile[]) {
        super();

        tiles?.forEach(tile => {
            this.tryAddTile(tile.coordinates, tile);
        })
        this.load();
    }

    public load(): void {
        this.tiles.forEach(tile => {
            tile.rigidBody.mesh.position.set(tile.coordinates.x, tile.coordinates.y, tile.coordinates.z);
        })
    }

    public dispose(): void {

    }

    public tryGetTile(coordinates: THREE.Vector3Like): Tile | undefined {
        const index = this.coordinates2Index(coordinates);
        return this.tiles.get(index);
    }

    public tryAddTile(coordinates: THREE.Vector3Like, tile: Tile): Course {
        const index = this.coordinates2Index(coordinates);
        if (this.tiles.has(index)) return this;

        this.tiles.set(index, tile);

        // const min = new THREE.Vector3(coordinates.x * tile.width - tile.width / 2,    0, coordinates.z * tile.length - tile.length / 2);
        // const max = new THREE.Vector3(coordinates.x * tile.width + tile.width / 2, 1000, coordinates.z * tile.length + tile.length / 2);
        // const box = new THREE.Box3(min, max);
        // this.bounds.union(box);
        return this;
    }

    public world2coordinates(coordinates: THREE.Vector3Like): THREE.Vector3 {
        const x = Math.round(coordinates.x / this.size);
        const y = Math.round(coordinates.y / this.size);
        const z = Math.round(coordinates.z / this.size);
        return new THREE.Vector3(x, y, z);
    }

    private index2Coordinates(index: string): THREE.Vector3 {
        try {
            const coordinates = index.split(":");
            const x = Number(coordinates[0]);
            const y = Number(coordinates[1]);
            const z = Number(coordinates[2]);
            return new THREE.Vector3(x, y, z);
        } catch (error) {
            throw new Error("");
        }
    }
    private coordinates2Index(coordinates: THREE.Vector3Like): string {
        return `${coordinates.x}:${coordinates.y}:${coordinates.z}`;
    }
}