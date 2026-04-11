import { level1, level3 } from "../course/courses";
import { Match } from "../match/match";
import { Player } from "../match/player";
import { NetworkHostMessage, NetworkMessagesTypes } from "../network/networkMessage";
import { Session } from "../session";
import { State } from "./state";

export class GameState extends State {
    private match: Match | null = null;
    private singlePlayer: string = "singleplayer";

    public enterState(): void {
        this.session.gamePage.attach();
        
        this.singlePlayer === "singleplayer" ? this.setSinglePlayerMatch() : this.setMultiplayerMatch();
    }

    public leaveState(): void {
        this.session.gamePage.dettach();

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
    }

    private setMultiplayerMatch(): void {
        if (!this.session.network) return;
        
        const message: NetworkHostMessage = {
            type: NetworkMessagesTypes.MATCH_START,
        }
        this.session.network.send(message);

        const localPlayer: Player = new Player(this.session.user);
        const allPlayers: Player[] = Array.from(this.session.network.players.values());
        allPlayers.push(localPlayer);

        const courses = [level1()];
        this.match = new Match(document.getElementById("game")!, localPlayer, allPlayers, courses);
    }
}
