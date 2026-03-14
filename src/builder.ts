import * as THREE from "three";
import { Tile } from "./tile";
import { Ball } from "./ball";
import { Monobehavior } from "./monobehavior";

export class Builder {
    public static readonly monobehaviors: Monobehavior[] = [];

    public static tile(color: THREE.ColorRepresentation = 0x00f000): Tile {
        const width = 100;
        const height = 1;
        const length = 100;
        
        const geometry = new THREE.BoxGeometry(width, height, length);
        const material = new THREE.MeshPhongMaterial({ color: color })
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        const monobehavior = new Tile(mesh, width, length);
        this.monobehaviors.push(monobehavior);
        return monobehavior;
    }

    public static ball(color: THREE.ColorRepresentation = 0xf00000): Ball {
        const geometry = new THREE.SphereGeometry();
        const material = new THREE.MeshPhongMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        const monobehavior = new Ball(mesh);
        this.monobehaviors.push(monobehavior);
        return monobehavior;
    }
}