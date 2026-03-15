import * as THREE from "three";
import { Monobehavior } from "./monobehavior";

export class Tile extends Monobehavior {
    public readonly width: number;
    public readonly height: number;
    public readonly depth: number;
    public readonly mesh: THREE.Mesh;

    public constructor(mesh: THREE.Mesh, width: number, height: number, depth: number) {
        super();
        
        this.mesh = mesh;
        this.width = width;
        this.height = height;
        this.depth = depth;
    }
}