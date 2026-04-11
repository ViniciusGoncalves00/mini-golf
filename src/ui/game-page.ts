import { User } from "../user";
import { Page } from "./page";

export class GamePage extends Page {
    public currentPlayer: User | null = null;
    public players: User[] | null = null;

    public constructor(parent: HTMLElement) {
        super(parent);
    }

    public setCurrentPlayer(id: string): void {
        // const player = this.players.find(user => user.ID === id);
        // if (!player) return;

        // this.currentPlayer = player;
    }

    protected buildElement(): HTMLElement {
        const element = document.createElement("div");
        element.className = "h-full w-full"
        element.innerHTML = `
            <div id="game-overlay" class="fixed w-full h-full flex flex-col pointer-events-none">
                <div id="game-overlay-top" class="w-full flex px-8 py-4 space-x-4">
                    <template x-for="player in $store.gamePage?.players">
                        <div class="flex rounded-fill skew-x-[-15deg] border border-amber-500">
                            <div class="h-16 aspect-square flex-none flex items-center justify-center bg-zinc-200/80 inset-shadow-[0px_0px_4px] inset-shadow-black/80">
                                <i class="text-5xl text-amber-500/80 bi bi-person-fill shadow"></i>
                            </div>
                            <div class="w-64 flex flex-col text-white">
                                <div class="h-1/2 w-full bg-amber-600/80 flex items-center justify-between px-2">
                                    <div x-text="$store.gamePage?.currentPlayer.ID == player.ID ? player.name (you) : player.name"></div>
                                    <div x-text="player.ID"></div>
                                </div>
                                <div class="h-1/2 w-full bg-amber-500/80 flex items-center px-2">Stroke 1</div>
                            </div>
                        </div>
                    </template>
                </div>
                <div id="game-overlay-mid" class="w-full h-full flex items-center justify-end p-4">
                    <div class="h-128 w-4 rotate-180 border rounded-lg bg-black/10" id="power-bar-container">
                        <template x-for="i in 10">
                            <div class="absolute w-full h-px bg-black" :style="{ top: i * 10 }"></div>
                        </template>
                        <div class="w-full rounded-lg opacity-80" id="power-bar"></div>
                    </div>    
                </div>
                <div id="game-overlay-bot" class="w-full"></div>
            </div>
            <canvas id="game" class="h-full w-full"></canvas>
        `
        return element;
    }
}