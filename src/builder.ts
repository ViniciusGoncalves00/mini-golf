import * as THREE from "three";
import { Tile } from "./tile";
import { Ball } from "./ball";
import { Monobehavior } from "./monobehavior";
import { Club } from "./club";

export class Builder {
    public static readonly monobehaviors: Monobehavior[] = [];

    public static rampTile(coordinates: THREE.Vector3Like, color: THREE.ColorRepresentation = 0x00f000, width = 10, height = 10, length = 10): Tile {
        const geometry = new THREE.BufferGeometry();

        const hw = width / 2;
        const hl = length / 2;

        const vertices = new Float32Array([
            // base (y = 0)
            -hw, 0, -hl, // 0
             hw, 0, -hl, // 1
             hw, 0,  hl, // 2
            -hw, 0,  hl, // 3

            // slope
            -hw, height, -hl, // 4 (high)
             hw, height, -hl, // 5 (high)
             hw, 0,       hl, // 6 (low)
            -hw, 0,       hl  // 7 (low)
        ]);

        // Índices (triângulos)
        const indices = [
            // base
            0, 1, 2,
            0, 2, 3,

            // rampa (topo inclinado)
            4, 5, 6,
            4, 6, 7,

            // lado esquerdo
            0, 4, 7,
            0, 7, 3,

            // lado direito
            1, 2, 6,
            1, 6, 5,

            // frente (parte alta)
            0, 1, 5,
            0, 5, 4,

            // trás (parte baixa)
            3, 7, 6,
            3, 6, 2
        ];

        geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        const material = new THREE.MeshPhongMaterial({ color: color })
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        const monobehavior = new Tile(coordinates, mesh, new THREE.Vector3(0, 1, 0), width, height, length);
        this.monobehaviors.push(monobehavior);
        return monobehavior;
    }

    public static planeTile(coordinates: THREE.Vector3Like, color: THREE.ColorRepresentation = 0x00f000, width = 10, height = 1, length = 10): Tile {
        const geometry = new THREE.BoxGeometry(width, height, length);
        const material = new THREE.MeshPhongMaterial({ color: color })
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        const monobehavior = new Tile(coordinates, mesh, new THREE.Vector3(0, 1, 0), width, height, length);
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