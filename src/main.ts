import "./style.css";
import { Session } from "./core/session";
import Alpine from 'alpinejs';
import { AudioSystem } from "./audio/audio-system";
import { sounds } from "./audio/audio-list";
import { StorageLoader } from "./core/storageLoader";
import { PageManager } from "./ui/page";
import { Settings } from "./settings";

export class Main {
    private static initialized: boolean = false;

    public static async init(): Promise<void> {
        if (this.initialized) return;
        this.initialized = true;

        const storage = StorageLoader.instance();
        storage.loadGLTF();
        storage.loadSTL();
        storage.loadTextures();
        
        document.addEventListener('alpine:init', () => {
            const session = new Session();
            Alpine.store("session", session);
            Alpine.store("room", session.room);
            session.loadNetwork();

            AudioSystem.instance().load(sounds);

            Alpine.store("storageLoader", StorageLoader.instance());
            Alpine.store("pageManager", PageManager.instance());
            Alpine.store("settings", Settings.instance(session));
        });

        (window as any).Alpine = Alpine;
        Alpine.start();
    }
}

Main.init();