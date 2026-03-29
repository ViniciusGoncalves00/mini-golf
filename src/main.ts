import Alpine from 'alpinejs';

import "./style.css";
import { Session } from "./session";

export class Main {
    private static initialized: boolean = false;

    public static async init(): Promise<void> {
        if (this.initialized) return;
        this.initialized = true;

        const session = new Session();
        
        document.addEventListener('alpine:init', () => {
            Alpine.store("ui", session.page);
        });

        (window as any).Alpine = Alpine;
        Alpine.start();
    }
}

Main.init();