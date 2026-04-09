import { User } from "../user";

export class GamePage {
    public currentPlayer: User;
    public players: User[];

    public constructor(players: User[]) {
        this.currentPlayer = players[0];
        this.players = players;
    }

    public setCurrentPlayer(id: string): void {
        const player = this.players.find(user => user.ID === id);
        if (!player) return;

        this.currentPlayer = player;
    }
}