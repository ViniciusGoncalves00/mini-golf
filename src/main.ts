import Alpine from 'alpinejs';

import "./style.css";
import { Session } from "./session";
import { HomePage } from './ui/home-page';
import { GamePage } from './ui/game-page';
import { StorageKey } from './common/enums';
import { StorageManager } from "./storageManager";
import { User } from './user';

export class Main {
    private static initialized: boolean = false;

    public static async init(): Promise<void> {
        if (this.initialized) return;
        this.initialized = true;
        
        document.addEventListener('alpine:init', () => {
            const parent = document.getElementById("body")!;

            const userData = StorageManager.getInstance().load(StorageKey.USER);
            const user = new User(userData?.ID, userData?.name);

            Alpine.store("homePage", new HomePage(parent, user));
            Alpine.store("gamePage", new GamePage(parent, user));

            new Session(user);
        });

        (window as any).Alpine = Alpine;
        Alpine.start();
    }
}

Main.init();