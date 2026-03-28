import Alpine from 'alpinejs';

import "./style.css";
import { Session } from "./session";
import { UI } from "./pages/ui";

export class Main {
    public static async init(): Promise<void> {
        new Session();
        
        document.addEventListener('alpine:init', () => {
            Alpine.store("ui", new UI());
        });

        (window as any).Alpine = Alpine;
        Alpine.start();
    }
}

Main.init();