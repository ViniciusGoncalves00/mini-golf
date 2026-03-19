import * as THREE from "three";
import { Monobehavior } from "./monobehavior";

export class Tile extends Monobehavior {
    public readonly width: number;
    public readonly height: number;
    public readonly depth: number;
    public readonly mesh: THREE.Mesh;
    public readonly coordinates: THREE.Vector3Like;

    public constructor(coordinates: THREE.Vector3Like, mesh: THREE.Mesh, width: number, height: number, depth: number) {
        super();
        
        this.coordinates = coordinates;
        this.mesh = mesh;
        this.width = width;
        this.height = height;
        this.depth = depth;

        this.mesh.position.set(this.width * this.coordinates.x, this.height * this.coordinates.y, this.depth * this.coordinates.z);
        this.mesh.position.set(coordinates.x, coordinates.y, coordinates.z);
    }

    public setColor(color: THREE.ColorRepresentation): void {
        this.mesh.material = new THREE.MeshPhongMaterial({color: color});
    }
}