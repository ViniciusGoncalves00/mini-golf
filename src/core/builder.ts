import * as THREE from "three";
import { Tile } from "./course/tile";
import { Ball } from "./match/ball";
import { Club } from "./match/club";
import { StorageLoader } from "./storageLoader";
import { Geometries, GeometriesGLB, Textures } from "./common/enums";

export class Builder {
    public static tile(coordinates: THREE.Vector3Like, geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation = 0x00f000, friction: number = 0.35, absorption: number = 0.55): Tile {
        const material = new THREE.MeshPhysicalMaterial({ color: color, normalMap: StorageLoader.instance().textures.get(Textures.GRASS_NORMAL), roughness: 0.35, reflectivity: 0.1, specularIntensity: 0.1 });
        const mesh = new THREE.Mesh(geometry, material);
        material.normalMap!.repeat = new THREE.Vector2(5, 5);
        mesh.name = "Tile";
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        return new Tile(coordinates, mesh, friction, absorption);
    }

    public static ball(id: string, color: THREE.ColorRepresentation = 0xfefefe, radius: number = 0.021335, friction: number = 0.35, absorption: number = 0.25): Ball {
        const geometry = StorageLoader.instance().geometries.get(GeometriesGLB.BALL);
        const material = new THREE.MeshPhysicalMaterial({ color: color, flatShading: false, roughness: 0.35, reflectivity: 1.0 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(0.001, 0.001, 0.001);
        mesh.name = id;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        return new Ball(mesh, radius, friction, absorption);
    }

    public static club(): Club {
        return  new Club();
    }
}