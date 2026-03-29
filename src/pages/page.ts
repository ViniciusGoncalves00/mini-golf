export class Page {
    public currentID: string = "home";
    public previousID: string = "home";

    public onStart = () => {};
    public onConnect = (value: string) => {};
    public onCreateRoom = () => {};
    public onCloseRoom = () => {};

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

    public start(): void {
        this.setPage("game");
        this.hideInterface();

        this.onStart();
    }

    public hideInterface(): void {
        document.getElementById("interface")!.setAttribute("hidden", "");
    }

    public showInterface(): void {
        document.getElementById("interface")!.removeAttribute("hidden");
    }

    public tryConnect(): void {
        const peerID = document.getElementById("PeerID")! as HTMLInputElement;
        this.onConnect(peerID.value);
    }

    public updatePlayerList(players: string[]): void {
        const playerList = document.getElementById("playersList")!;
        playerList.childNodes.forEach((child) => child.remove());

        players.forEach((player) => {
            const playerItem = document.createElement("div");
            playerItem.innerText = player;
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