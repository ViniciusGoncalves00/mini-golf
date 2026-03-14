import * as THREE from "three";
import { Tile } from "./tile";
import { Monobehavior } from "./monobehavior";

export class Board extends Monobehavior {
    private readonly tiles: Map<string, Tile> = new Map();

    public tryGetTile(coordinates: THREE.Vector2Like): Tile | undefined {
        const index = this.coordinates2Index(coordinates);
        return this.tiles.get(index);
    }

    public tryAddTile(coordinates: THREE.Vector2Like, tile: Tile): Board {
        const index = this.coordinates2Index(coordinates);
        if (this.tiles.has(index)) return this;

        this.tiles.set(index, tile);
        return this;
    }

    private index2Coordinates(index: string): THREE.Vector2 {
        try {
            const coordinates = index.split(":");
            const x = Number(coordinates[0]);
            const y = Number(coordinates[1]);
            return new THREE.Vector2(x, y)
        } catch (error) {
            throw new Error("");
        }
    }
    private coordinates2Index(coordinates: THREE.Vector2Like): string {
        return `${coordinates.x}:${coordinates.y}`;
    }
}