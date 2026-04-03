import * as THREE from "three";
import { Tile } from "./tile";
import { Ball } from "./ball";
import { Club } from "./club";

export class Builder {
    public static tile(coordinates: THREE.Vector3Like, geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation = 0x00f000, friction: number = 0.35, absorption: number = 0.55): Tile {
        const material = new THREE.MeshPhongMaterial({ color: color })
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = "Tile";
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        return new Tile(coordinates, mesh, new THREE.Vector3(0, 1, 0), friction, absorption);
    }

    public static ball(color: THREE.ColorRepresentation = 0xfefefe, radius: number = 0.04): Ball {
        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshPhongMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = "Ball";
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        return new Ball(mesh, radius);
    }

    public static club(ball: Ball): Club {
        return  new Club(ball);
    }
}