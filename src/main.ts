import Alpine from 'alpinejs';

import "./style.css";
import { Session } from "./session";
import { HomePage } from './ui/home-page';
import { GamePage } from './ui/game-page';

export class Main {
    private static initialized: boolean = false;

    public static async init(): Promise<void> {
        if (this.initialized) return;
        this.initialized = true;
        
        document.addEventListener('alpine:init', () => {
            const parent = document.getElementById("body")!;

            Alpine.store("homePage", new HomePage(parent));
            Alpine.store("gamePage", new GamePage(parent));

            new Session();
        });

        (window as any).Alpine = Alpine;
        Alpine.start();
    }
}

Main.init();