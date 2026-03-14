import * as THREE from "three";
import { Monobehavior } from "./monobehavior";

export class Tile extends Monobehavior {
    public readonly width: number;
    public readonly length: number;
    public readonly mesh: THREE.Mesh;

    public constructor(mesh: THREE.Mesh, width: number, length: number) {
        super();
        
        this.mesh = mesh;
        this.width = width;
        this.length = length;
    }
}