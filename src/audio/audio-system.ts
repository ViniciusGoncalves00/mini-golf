import { AudioAPI, AudioKey } from "@/audio/audio-API";
import { Storage } from "@/common/storage";
import { Pool } from "@/common/pool";
import { AudioSource } from "@/audio/audio-source";

export class AudioSystem {
    private readonly storage = new Storage("audio");
    private readonly pools = new Map<AudioKey, Pool<AudioSource>>();

    private static _instance: AudioSystem | null = null;

    private constructor() {
        window.addEventListener(AudioAPI.AUDIO_ENABLE, () => {
            this.setEnabled(true);
        })
        window.addEventListener(AudioAPI.AUDIO_DISABLE, () => {
            this.setEnabled(false);
        })
        window.addEventListener(AudioAPI.AUDIO_PLAY, (e: any) => {
            const audio = e.detail.audio;
            if (audio === undefined) return;
            const volume = e.detail.volume ?? 1;
            this.play(audio, volume);
        })
    }

    public static instance(): AudioSystem {
        if (!this._instance) this._instance = new AudioSystem();
        return this._instance;
    }

    public setEnabled(state: boolean): void {
        this.storage.save("enabled", String(state));
    }

    public isEnabled(): boolean {
        return this.storage.get("enabled") !== "false";
    }

    /**
     * Loads audio sources and creates a pool per AudioAPI key.
     */
    public load(
        sources: Map<AudioKey, string[]>,
        voices: number = 4
    ): AudioSystem {
        for (const [key, srcList] of sources) {
            const pool = new Pool<AudioSource>(() => {
                return new AudioSource(srcList, {
                    preload: true
                });
            });

            for (let i = 0; i < voices; i++) {
                pool.release(pool.acquire());
            }

            this.pools.set(key, pool);
        }

        return this;
    }

    /**
     * Plays a sound using its pool.
     */
    public play(key: AudioKey, volume: number): void {
        if (!this.isEnabled()) return;

        const pool = this.pools.get(key);
        if (!pool) return;

        const source = pool.acquire();
        source.setVolume(volume);
        source.playRandom();

        setTimeout(() => {
            pool.release(source);
        }, 1000);
    }
}
