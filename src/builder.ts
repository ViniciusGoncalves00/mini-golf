import * as THREE from "three";
import { Tile } from "./tile";
import { Ball } from "./ball";
import { Monobehavior } from "./monobehavior";
import { Club } from "./club";

export class Builder {
    public static readonly monobehaviors: Monobehavior[] = [];

    public static tile(coordinates: THREE.Vector3Like, color: THREE.ColorRepresentation = 0x00f000, width = 10, height = 0.5, length = 10): Tile {
        const geometry = new THREE.BoxGeometry(width, height, length);
        const material = new THREE.MeshPhongMaterial({ color: color })
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        const monobehavior = new Tile(coordinates, mesh, width, height, length);
        this.monobehaviors.push(monobehavior);
        return monobehavior;
    }

    public static ball(color: THREE.ColorRepresentation = 0xfefefe): Ball {
        const geometry = new THREE.SphereGeometry();
        const material = new THREE.MeshPhongMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        const monobehavior = new Ball(mesh);
        this.monobehaviors.push(monobehavior);
        return monobehavior;
    }

    public static club(ball: Ball): Club {
        const monobehavior = new Club(ball);
        this.monobehaviors.push(monobehavior);
        return monobehavior;
    }
}