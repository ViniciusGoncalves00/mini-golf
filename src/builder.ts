import * as THREE from "three";
import { Tile } from "./tile";
import { Ball } from "./ball";
import { Monobehavior } from "./monobehavior";
import { Club } from "./club";

export class Builder {
    public static readonly monobehaviors: Monobehavior[] = [];

    public static planeTile(coordinates: THREE.Vector3Like, geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation = 0x00f000): Tile {
        const material = new THREE.MeshPhongMaterial({ color: color })
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = "Plane Tile";
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        const monobehavior = new Tile(coordinates, mesh, new THREE.Vector3(0, 1, 0));
        this.monobehaviors.push(monobehavior);
        return monobehavior;
    }

    public static ball(color: THREE.ColorRepresentation = 0xfefefe, radius: number = 0.04): Ball {
        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshPhongMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = "Ball";
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        const monobehavior = new Ball(mesh, radius);
        this.monobehaviors.push(monobehavior);
        return monobehavior;
    }

    public static club(ball: Ball): Club {
        const monobehavior = new Club(ball);
        this.monobehaviors.push(monobehavior);
        return monobehavior;
    }
}