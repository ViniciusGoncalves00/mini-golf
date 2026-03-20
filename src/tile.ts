import * as THREE from "three";
import { Monobehavior } from "./monobehavior";

export class Tile extends Monobehavior {
    public readonly width: number;
    public readonly height: number;
    public readonly length: number;
    public readonly mesh: THREE.Mesh;
    public readonly coordinates: THREE.Vector3Like;

    public readonly normal: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
    public readonly friction: number = 0.98;
    public readonly absorption: number = 0.99;

    public constructor(coordinates: THREE.Vector3Like, mesh: THREE.Mesh, width: number, height: number, length: number) {
        super();
        
        this.coordinates = coordinates;
        this.mesh = mesh;
        this.width = width;
        this.height = height;
        this.length = length;
    }

    public setColor(color: THREE.ColorRepresentation): void {
        this.mesh.material = new THREE.MeshPhongMaterial({color: color});
    }
}