import * as THREE from "three";
import { Tile } from "./course/tile";
import { Ball } from "./match/ball";
import { Club } from "./match/club";
import { StorageLoader } from "./storageLoader";
import { Textures } from "./common/enums";

export class Builder {
    public static tile(coordinates: THREE.Vector3Like, geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation = 0x00f000, friction: number = 0.35, absorption: number = 0.55): Tile {
        const material = new THREE.MeshPhysicalMaterial({ color: color, normalMap: StorageLoader.instance().textures.get(Textures.GRASS_NORMAL) });
        const mesh = new THREE.Mesh(geometry, material);
        material.normalMap!.repeat = new THREE.Vector2(5, 5);
        material.iridescence = 0.5;
        mesh.name = "Tile";
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        return new Tile(coordinates, mesh, friction, absorption);
    }

    public static ball(id: string, color: THREE.ColorRepresentation = 0xfefefe, radius: number = 0.021335, friction: number = 0.35, absorption: number = 0.25): Ball {
        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshPhongMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = id;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        return new Ball(mesh, radius, friction, absorption);
    }

    public static club(): Club {
        return  new Club();
    }
}