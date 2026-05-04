import * as THREE from "three";
import { Session } from "./core/session";

export class Settings {
    private static _instance: Settings | null = null;
    private static _session: Session | null = null;

    private constructor() {}

    public static instance(session: Session): Settings {
        if (!this._instance) {
            this._instance = new Settings();
            this._session = session;
        }
        return this._instance;
    }

    public setShadowMapSize(size: number): void {
        const min = 9; // 2**9 = 512
        const max = 14; // 2**14 = 16_384
        const clamped = THREE.MathUtils.clamp(min + size, min, max);
        const value = 2 ** clamped;
        
        const light = Settings._session?.match?.world.sceneWrapper.globalLight!;
        light.shadow.mapSize.set(value, value);
        light.shadow.map?.dispose();
        light.shadow.map = null;
    }
}