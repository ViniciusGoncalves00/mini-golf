import { degToRad } from "three/src/math/MathUtils.js";
import { Builder } from "../builder";
import { Course } from "../course";
import { StorageManager } from "../storageManager";
import { Tile } from "../tile";

const storage = await StorageManager.init();
const plane = storage.geometries.get("plane")!;
const planeCorner = storage.geometries.get("plane_corner")!;
const planeHole = storage.geometries.get("plane_hole")!;
const planeParallel = storage.geometries.get("plane_parallel")!;
const planeU = storage.geometries.get("plane_u")!;
const planeWall = storage.geometries.get("plane_wall")!;

export const level1 = () => {
    const tiles: Tile[] = []
    const rows = 7;
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

            const color = (column + row) % 2 == 0 ? 0x00aa00 : 0x00cc00;

            const tile = Builder.planeTile({x: column, y: 0, z: row}, geometry, color);
            tiles.push(tile);
        }
    }
    
    return new Course(tiles);
}