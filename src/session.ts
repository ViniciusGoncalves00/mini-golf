import { Match } from "./match/match";
import { StorageManager } from "./storageManager";
import { User } from "./user";
import { StorageKey } from "./common/enums";
import { PeerHost } from "./network/PeerHost";
import { PeerClient } from "./network/PeerClient";
import { Context } from "./session/context";
import { HomeState } from "./session/homeState";
import { GameState } from "./session/gameState";

export class Session {
    public readonly user: User;

    public readonly context: Context;
    public readonly homeState: HomeState;
    public readonly gameState: GameState;

    public network: PeerHost | PeerClient | null = null;
    public match: Match | null = null;
    
    public constructor(user: User) {
        this.user = user;

        this.context = new Context();
        this.homeState = new HomeState(this);
        this.gameState = new GameState(this);
        this.context.set(this.homeState);
    }
}