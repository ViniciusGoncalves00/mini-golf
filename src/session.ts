import { Match } from "./match/match";
import { HomePage } from "./ui/home-page";
import { StorageManager } from "./storageManager";
import { User } from "./user";
import { StorageKey } from "./common/enums";
import { PeerHost } from "./network/PeerHost";
import { PeerClient } from "./network/PeerClient";
import { GamePage } from "./ui/game-page";
import { Context } from "./session/context";
import { HomeState } from "./session/homeState";
import { GameState } from "./session/gameState";

export class Session {
    public readonly user: User;

    public readonly context: Context;
    public readonly homeState: HomeState;
    public readonly gameState: GameState;

    public readonly homePage: HomePage;
    public readonly gamePage: GamePage;

    public network: PeerHost | PeerClient | null = null;
    public match: Match | null = null;
    
    public constructor() {
        const user = StorageManager.getInstance().load(StorageKey.USER);
        this.user = new User(undefined, user?.name);

        const parent = document.getElementById("body")!;
        this.homePage = new HomePage(parent);
        this.gamePage = new GamePage(parent);

        this.context = new Context();
        this.homeState = new HomeState(this);
        this.gameState = new GameState(this);
        this.context.setState(this.homeState);
    }
}