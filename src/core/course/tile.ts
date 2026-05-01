import * as THREE from "three";
import { Monobehavior } from "../monobehavior";
import { RigidBody } from "../physics/rigidBody";

export class Tile extends Monobehavior {
    public readonly rigidBody: RigidBody;
    public readonly coordinates: THREE.Vector3Like;

    public constructor(coordinates: THREE.Vector3Like, mesh: THREE.Mesh, friction: number, absorption: number) {
        super();
        
        this.rigidBody = new RigidBody(mesh);

        this.coordinates = coordinates;
        this.rigidBody.dragCoeficient = friction;
        this.rigidBody.absorption = absorption;
    }

    public setColor(color: THREE.ColorRepresentation): void {
        this.rigidBody.mesh.material = new THREE.MeshPhongMaterial({color: color});
    }
}