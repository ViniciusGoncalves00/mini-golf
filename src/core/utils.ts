import * as THREE from "three";

export class VectorUtils {
    public static readonly RIGHT    = new THREE.Vector3( 1,  0,  0);
    public static readonly LEFT     = new THREE.Vector3(-1,  0,  0);
    public static readonly UP       = new THREE.Vector3( 0,  1,  0);
    public static readonly DOWN     = new THREE.Vector3( 0, -1,  0);
    public static readonly FORWARD  = new THREE.Vector3( 0,  0,  1);
    public static readonly BACKWARD = new THREE.Vector3( 0,  0, -1);
}