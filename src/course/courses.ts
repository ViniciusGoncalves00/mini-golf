import { degToRad } from "three/src/math/MathUtils.js";
import { Builder } from "../builder";
import { Course } from "../course";
import { StorageManager } from "../storageManager";
import { Tile } from "../tile";
import { Colors, Tiles } from "../common/enums";

const storage = StorageManager.getInstance();
await storage.loadSTL();
const plane45 = storage.geometries.get(Tiles.PLANE_45)!;
const plane = storage.geometries.get(Tiles.PLANE)!;
const planeCorner = storage.geometries.get(Tiles.CORNER)!;
const planeHole = storage.geometries.get(Tiles.HOLE)!;
const planeParallel = storage.geometries.get(Tiles.PARALLEL)!;
const planeU = storage.geometries.get(Tiles.U)!;
const planeWall = storage.geometries.get(Tiles.WALL)!;

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