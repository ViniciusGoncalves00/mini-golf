import * as THREE from "three";
import { Monobehavior } from "./monobehavior";

export class Tile extends Monobehavior {
    public readonly width: number;
    public readonly height: number;
    public readonly length: number;
    public readonly mesh: THREE.Mesh;
    public readonly coordinates: THREE.Vector3Like;

    public readonly normal: THREE.Vector3;
    public readonly collider: THREE.Box3;
    
    public readonly friction: number = 0.35;
    public readonly absorption: number = 0.55;

    public constructor(coordinates: THREE.Vector3Like, mesh: THREE.Mesh, normal: THREE.Vector3, width: number, height: number, length: number) {
        super();
        
        this.coordinates = coordinates;
        this.mesh = mesh;
        this.normal = normal;

        this.width = width;
        this.height = height;
        this.length = length;

        this.collider = new THREE.Box3(
            new THREE.Vector3(width * coordinates.x - width / 2, height * coordinates.y - height / 2, length * coordinates.z - length / 2),
            new THREE.Vector3(width * coordinates.x + width / 2, height * coordinates.y + height / 2, length * coordinates.z + length / 2),
        )
    }

    public setColor(color: THREE.ColorRepresentation): void {
        this.mesh.material = new THREE.MeshPhongMaterial({color: color});
    }
}