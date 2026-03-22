import * as THREE from "three";

export class World {
    public static readonly gravity: THREE.Vector3 = new THREE.Vector3(0, -20, 0);

    public static readonly windDrag: number = 0.05;
    public static readonly windSpeed: number = 0.01;
    public static readonly windDirection: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
}0