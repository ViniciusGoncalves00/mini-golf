import * as THREE from "three";

export class Ambient {
    public static get gravity(): THREE.Vector3 { return this._gravity.clone() }
    
    public static readonly airViscosity: number = 0.05;
    public static readonly airDensity: number = 0.05;
    
    public static readonly windSpeed: number = 0.01;
    public static readonly windDirection: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    
    private static readonly _gravity: THREE.Vector3 = new THREE.Vector3(0, -1, 0);
}