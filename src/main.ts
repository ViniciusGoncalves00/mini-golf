import "./style.css";
import { Session } from "./core/session";
import Alpine from 'alpinejs';

export class Main {
    private static initialized: boolean = false;

    public static async init(): Promise<void> {
        if (this.initialized) return;
        this.initialized = true;
        
        document.addEventListener('alpine:init', () => {
            const session = new Session();
            Alpine.store("session", session);
            Alpine.store("room", session.room);
        });

        (window as any).Alpine = Alpine;
        Alpine.start();
    }
}

Main.init();