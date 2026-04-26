import "./style.css";
import { Session } from "./core/session";
import Alpine from 'alpinejs';
import { AudioSystem } from "./audio/audio-system";
import { sounds } from "./audio/audio-list";
import { StorageLoader } from "./core/storageLoader";

export class Main {
    private static initialized: boolean = false;

    public static async init(): Promise<void> {
        if (this.initialized) return;
        this.initialized = true;
        
        document.addEventListener('alpine:init', () => {
            const session = new Session();
            Alpine.store("session", session);
            Alpine.store("room", session.room);
            session.loadNetwork();

            AudioSystem.instance().load(sounds);

            Alpine.store("storageLoader", StorageLoader.instance());
        });

        (window as any).Alpine = Alpine;
        Alpine.start();
    }
}

Main.init();