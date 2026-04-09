export class Page {
    public currentID: string = "home";
    public previousID: string = "home";

    public onStartSingleplayer = () => {};
    public onStartMultiplayer = () => {};
    public onCreateRoom = () => {};
    public onCloseRoom = () => {};
    public onJoinRoom = (value: string) => {};

    public setHomePage(): void {
        this.setPage("home");
    }

    public setSinglePlayerPage(): void {
        this.setPage("singleplayer");
    }

    public setMultiPlayerPage(): void {
        this.setPage("multiplayer");
    }

    public setCreateRoomPage(): void {
        this.setPage("room");
        this.onCreateRoom();
    }

    public closeRoom(): void {
        this.onCloseRoom();
    }

    public setRoomPage(): void {
        this.setPage("room");
    }

    public setJoinRoomPage(): void {
        this.setPage("joinRoom");
    }

    public setGamePage(): void {
        this.setPage("game-container");
    }

    public startSingleplayer(): void {
        this.setGamePage();
        this.hideInterface();

        this.onStartSingleplayer();
    }

    public startMultiplayer(): void {
        this.setGamePage();
        this.hideInterface();

        this.onStartMultiplayer();
    }

    public hideInterface(): void {
        document.getElementById("interface")!.setAttribute("hidden", "");
    }

    public showInterface(): void {
        document.getElementById("interface")!.removeAttribute("hidden");
    }

    public tryConnect(): void {
        const peerID = document.getElementById("PeerID")! as HTMLInputElement;
        this.onJoinRoom(peerID.value);
    }

    public updatePlayerList(players: {ID: string, name: string}[]): void {
        const playerList = document.getElementById("playersList")!;
        playerList.childNodes.forEach((child) => child.remove());

        players.forEach((player) => {
            const playerItem = document.createElement("div");
            playerItem.innerText = `ID: ${player.ID} NAME: ${player.name}`;
            playerList.appendChild(playerItem);
        })
    }

    private setPage(id: string): void {
        this.previousID = this.currentID;
        this.currentID = id;
        document.getElementById(this.previousID)!.setAttribute("hidden", "");
        document.getElementById(this.currentID)!.removeAttribute("hidden");
    }
}