import * as THREE from "three";
import { Monobehavior } from "./monobehavior";

export class Tile extends Monobehavior {
    public readonly mesh: THREE.Mesh;
    public readonly coordinates: THREE.Vector3Like;
    public readonly normal: THREE.Vector3;    
    public readonly friction: number;
    public readonly absorption: number;

    public constructor(coordinates: THREE.Vector3Like, mesh: THREE.Mesh, normal: THREE.Vector3, friction: number, absorption: number) {
        super();
        
        this.coordinates = coordinates;
        this.mesh = mesh;
        this.normal = normal;
        this.friction = friction;
        this.absorption = absorption;
    }

    public setColor(color: THREE.ColorRepresentation): void {
        this.mesh.material = new THREE.MeshPhongMaterial({color: color});
    }
}