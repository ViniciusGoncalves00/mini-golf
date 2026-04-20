import * as THREE from "three";
import { Tile } from "./course/tile";
import { Ball } from "./match/ball";
import { Club } from "./match/club";

export class Builder {
    public static tile(coordinates: THREE.Vector3Like, geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation = 0x00f000, friction: number = 0.35, absorption: number = 0.55): Tile {
        const material = new THREE.MeshPhongMaterial({ color: color })
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = "Tile";
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        return new Tile(coordinates, mesh, friction, absorption);
    }

    public static ball(id: string, color: THREE.ColorRepresentation = 0xfefefe, radius: number = 0.021335): Ball {
        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshPhongMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.uuid = id;
        mesh.name = "Ball";
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        return new Ball(mesh, radius);
    }

    public static club(): Club {
        return  new Club();
    }
}