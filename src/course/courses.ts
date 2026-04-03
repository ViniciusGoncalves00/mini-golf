import { degToRad } from "three/src/math/MathUtils.js";
import { Builder } from "../builder";
import { Course } from "../course";
import { StorageManager } from "../storageManager";
import { Tile } from "../tile";
import { Colors, Tiles } from "../common/enums";
import { GeometryBuilder } from "../geometry/geometryBuilder";
import * as THREE from "three";

const storage = StorageManager.getInstance();
await storage.loadSTL();
const plane45 = storage.geometries.get(Tiles.PLANE_45)!;
const plane = storage.geometries.get(Tiles.PLANE)!;
const loop = storage.geometries.get(Tiles.LOOP)!;
const planeCorner = storage.geometries.get(Tiles.CORNER)!;
const planeHole = storage.geometries.get(Tiles.HOLE)!;
const planeParallel = storage.geometries.get(Tiles.PARALLEL)!;
const planeU = storage.geometries.get(Tiles.U)!;
const planeWall = storage.geometries.get(Tiles.WALL)!;
const ramp15NoWalls = storage.geometries.get(Tiles.RAMP_15_NO_WALLS)!.rotateY(Math.PI);
const ramp15WallLeft = storage.geometries.get(Tiles.RAMP_15_WALL_LEFT)!.rotateY(Math.PI);
const ramp15WallRight = storage.geometries.get(Tiles.RAMP_15_WALL_RIGHT)!.rotateY(Math.PI);
const ramp15TwoWalls = storage.geometries.get(Tiles.RAMP_15_TWO_WALLS)!.rotateY(Math.PI);

export const level1 = () => {
    const tiles: Tile[] = []
    const rows = 13;
    const columns = 3;

    for (let column = 0; column < columns; column++) {
        for (let row = 0; row < rows; row++) {

            let geometry;

            const isCorner = row === 0 && column === 0 || row === 0 && column === columns - 1 || row === rows - 1 && column === 0 || row === rows - 1 && column === columns - 1;
            const isSide = column === 0 && !isCorner || column === columns - 1 && !isCorner || row === 0  && !isCorner || row === rows - 1  && !isCorner;
            
            if (row === 0 && column === 0) {
                geometry = planeCorner.clone();
            } else if (row === 0 && column === columns - 1) {
                geometry = planeCorner.clone();
                geometry.rotateY(-Math.PI / 2);
            } else if (row === rows - 1 && column === 0) {
                geometry = planeCorner.clone();
                geometry.rotateY(Math.PI / 2);
            } else if (row === rows - 1 && column === columns - 1) {
                geometry = planeCorner.clone();
                geometry.rotateY(Math.PI);
            } else if (column === 0 && !isCorner) {
                geometry = planeWall.clone();
            } else if (column === columns - 1 && !isCorner) {
                geometry = planeWall.clone();
                geometry.rotateY(Math.PI);
            } else if (row === 0 && !isCorner) {
                geometry = planeWall.clone();
                geometry.rotateY(-Math.PI / 2);
            } else if (row === rows - 1 && !isCorner) {
                geometry = planeWall.clone();
                geometry.rotateY(Math.PI / 2);
            } else if (column === 1 && row === rows - 2) {
                geometry = planeHole.clone();
            }
             else {
                geometry = plane;
            }

            const color = (column + row) % 2 == 0 ? Colors.DARK_GREEN : Colors.LIGHT_GREEN;

            const tile = Builder.planeTile({x: column, y: 0, z: row}, geometry, color);
            tiles.push(tile);
        }
    }
    
    return new Course(tiles);
}

export const level2 = () => {
    const tiles: Tile[] = []
    const rows = 13;
    const columns = 1;

    let y = 0;
    for (let x = 0; x < columns; x++) {
        for (let z = 0; z < rows; z++) {
            let geometry;
            if (z === 0) {
                geometry = planeU.clone();
            } else if (z === rows - 1) {
                geometry = planeU.clone();
                geometry.rotateY(Math.PI);
            } else if (z === rows - 2) {
                geometry = planeHole.clone();
            } else {
                geometry = planeParallel.clone();
            }

            const color = (x + z) % 2 == 0 ? 0x00aa00 : 0x00cc00;

            const tile = Builder.planeTile({x: x, y: y--, z: z}, geometry, color);
            tiles.push(tile);
        }
    }
    return new Course(tiles);
}

export const level3 = () => {
    const tiles: Tile[] = [];
    const rows = 8;
    const columns = 4;
    const middleRow = Math.round(rows / 2);

    type GridTile = {
        x: number;
        z: number;
        geometry: THREE.BufferGeometry;
        rotationY?: number;
        translateY?: number;
        friction?: number;
        absorption?: number;
    };

    const tileDefinitions: GridTile[] = [
        // Comeco
        { x: 0, z: 0, geometry: planeCorner },
        { x: 1, z: 0, geometry: planeWall, rotationY: -Math.PI / 2 },
        { x: 2, z: 0, geometry: planeWall, rotationY: -Math.PI / 2 },
        { x: 3, z: 0, geometry: planeCorner, rotationY: -Math.PI / 2 },

        // Meio (rampas)
        { x: 0, z: 2, geometry: ramp15WallRight },
        { x: 1, z: 2, geometry: ramp15NoWalls },
        { x: 2, z: 2, geometry: ramp15NoWalls },
        { x: 3, z: 2, geometry: ramp15WallLeft },

        { x: 0, z: rows - 3, geometry: ramp15WallLeft, rotationY: Math.PI },
        { x: 1, z: rows - 3, geometry: ramp15NoWalls, rotationY: Math.PI },
        { x: 2, z: rows - 3, geometry: ramp15NoWalls, rotationY: Math.PI },
        { x: 3, z: rows - 3, geometry: ramp15WallRight, rotationY: Math.PI },

        // Parede central
        { x: 0, z: 3, geometry: planeWall, translateY: 0.267949 },
        { x: 1, z: 3, geometry: plane, translateY: 0.267949 },
        { x: 2, z: 3, geometry: plane, translateY: 0.267949 },
        { x: 3, z: 3, geometry: planeWall, rotationY: Math.PI, translateY: 0.267949 },

        { x: 0, z: 4, geometry: planeWall, translateY: 0.267949 },
        { x: 1, z: 4, geometry: plane, translateY: 0.267949 },
        { x: 2, z: 4, geometry: plane, translateY: 0.267949 },
        { x: 3, z: 4, geometry: planeWall, rotationY: Math.PI, translateY: 0.267949 },

        // Fim
        { x: 0, z: rows - 1, geometry: planeCorner, rotationY: Math.PI / 2 },
        { x: 1, z: rows - 1, geometry: planeWall, rotationY: Math.PI / 2 },
        { x: 2, z: rows - 1, geometry: planeWall, rotationY: Math.PI / 2 },
        { x: 3, z: rows - 1, geometry: planeCorner, rotationY: Math.PI },
    ];

    // Laterais contínuas (excluindo cantos)
    for (let z = 1; z < rows - 1; z++) {
        if (z !== middleRow - 1 && z !== middleRow) {
            tileDefinitions.push({ x: 0, z, geometry: planeWall });
            tileDefinitions.push({ x: columns - 1, z, geometry: planeWall, rotationY: Math.PI });
        }
    }

    for (let x = 0; x < columns; x++) {
        for (let z = 0; z < rows; z++) {
            const found = tileDefinitions.find((t) => t.x === x && t.z === z);

            let geometry = found?.geometry.clone() ?? plane.clone();
            if (found?.rotationY) geometry.rotateY(found.rotationY);
            if (found?.translateY) geometry.translate(0, found.translateY, 0);

            const color = (x + z) % 2 === 0 ? Colors.DARK_GREEN : Colors.LIGHT_GREEN;
            tiles.push(Builder.planeTile({ x, y: 0, z }, geometry, color, found?.friction, found?.absorption));
        }
    }

    return new Course(tiles);
};