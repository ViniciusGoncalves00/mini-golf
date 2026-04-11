import { level1, level3 } from "../course/courses";
import { Match } from "../match/match";
import { Player } from "../match/player";
import { NetworkHostMessage, NetworkMessagesTypes } from "../network/networkMessage";
import { Session } from "../session";
import { GamePage } from "../ui/game-page";
import { State } from "./state";
import Alpine from 'alpinejs';

export class GameState extends State {
    private match: Match | null = null;
    private singlePlayer: string = "singleplayer";

    public enterState(): void {
        (Alpine.store("gamePage") as GamePage).attach();
        
        this.singlePlayer === "singleplayer" ? this.setSinglePlayerMatch() : this.setMultiplayerMatch();
    }

    public leaveState(): void {
        (Alpine.store("gamePage") as GamePage).dettach();

        this.match = null;
    }

    public setMatchType(singlePlayer: "singleplayer" | "multiplayer"): void {
        this.singlePlayer = singlePlayer;
    }

    private setSinglePlayerMatch(): void {
        const player = new Player(this.session.user);
        const courses = [level3()];
        this.match = new Match(document.getElementById("game")!, player, [player], courses);

        player.club.onFreeShot.push((force) => {
            player.ball.rigidBody.applyForce(force);
        })
        
        Alpine.store("gamePage").users.splice(0);
        Alpine.store("gamePage").users.push(this.session.user);
    }

    private setMultiplayerMatch(): void {
        if (!this.session.network) return;
        
        const message: NetworkHostMessage = {
            type: NetworkMessagesTypes.MATCH_START,
        }
        this.session.network.send(message);

        const users = Array.from(this.session.network.users.values());
        users.push(this.session.user);

        const player = new Player(this.session.user);
        const players: Player[] = [];
        Array.from(this.session.network.users.values()).forEach(user => players.push(new Player(user)))

        const courses = [level1()];
        this.match = new Match(document.getElementById("game")!, player, players, courses);

        Alpine.store("gamePage").users.splice(0);
        Alpine.store("gamePage").users.push(...users);
    }
}
