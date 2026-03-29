import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Ball } from "./ball";
import { Builder } from "./builder";
import { Club } from "./club";
import { User } from "./user";

export class Player {
    public readonly ball: Ball = Builder.ball();
    public readonly club: Club = Builder.club(this.ball);
    public camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    public orbitControls!: OrbitControls;

    public readonly user: User;

    public constructor(user: User, canvas: HTMLElement) {
        this.user = user;

        this.orbitControls = new OrbitControls( this.camera, canvas );
        this.orbitControls.enablePan = false;
    }
}