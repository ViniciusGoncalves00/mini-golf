import { User } from "../user";
import { Page } from "./page";

export class HomePage extends Page {
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
        // document.getElementById("interface")!.setAttribute("hidden", "");
    }

    public showInterface(): void {
        // document.getElementById("interface")!.removeAttribute("hidden");
    }

    public tryConnect(): void {
        const peerID = document.getElementById("PeerID")! as HTMLInputElement;
        this.onJoinRoom(peerID.value);
    }

    public updateUsersList(users: User[]): void {
        const usersList = document.getElementById("usersList")!;
        usersList.childNodes.forEach((child) => child.remove());

        users.forEach((user) => {
            const userItem = document.createElement("div");
            userItem.innerText = `ID: ${user.ID} NAME: ${user.name}`;
            usersList.appendChild(userItem);
        })
    }

    protected buildElement(): HTMLElement {
        const element = document.createElement("div");
        element.className = "h-full w-full flex items-center justify-center relative"
        element.innerHTML =`
            <div class="bg-grid blur-xs h-full w-full absolute -z-10"></div>
            <div id="home" class="bg-amber-500/80 h-full w-1/2 flex flex-col items-center justify-center gap-2 border-x-2 border-amber-300">
                <button type="button" @click="$store.homePage.setSinglePlayerPage()" class="cursor-pointer bg-white rounded-full py-2 px-4">SinglePlayer</button>
                <button type="button" @click="$store.homePage.setMultiPlayerPage()" class="cursor-pointer bg-white rounded-full py-2 px-4">MultiPlayer</button>
            </div>
            <div id="singleplayer" class="bg-amber-500/80 h-full w-1/2 flex flex-col items-center justify-center gap-2 border-x-2 border-amber-300" hidden>
                <button type="button" @click="$store.homePage.startSingleplayer()" class="cursor-pointer bg-white rounded-full py-2 px-4">Start</button>
                <button type="button" @click="$store.homePage.setHomePage()" class="cursor-pointer bg-white rounded-full py-2 px-4">Back</button>
            </div>
            <div id="multiplayer" class="bg-amber-500/80 h-full w-1/2 flex flex-col items-center justify-center gap-2 border-x-2 border-amber-300" hidden>
                <button type="button" @click="$store.homePage.setCreateRoomPage()" class="cursor-pointer bg-white rounded-full py-2 px-4">Create Room</button>
                <button type="button" @click="$store.homePage.setJoinRoomPage()" class="cursor-pointer bg-white rounded-full py-2 px-4">Join Room</button>
                <button type="button" @click="$store.homePage.setHomePage()" class="cursor-pointer bg-white rounded-full py-2 px-4">Back</button>
            </div>
            <div id="joinRoom" class="bg-amber-500/80 h-full w-1/2 flex flex-col items-center justify-center gap-2 border-x-2 border-amber-300" hidden>
                <input id="PeerID" type="text" placeholder="Enter room ID" class="bg-white rounded-full py-2 px-4">
                <button id="Connect" @click="$store.homePage.tryConnect()" class="cursor-pointer bg-white rounded-full py-2 px-4">Connect</button>
                <button type="button" @click="$store.homePage.setMultiPlayerPage()" class="cursor-pointer bg-white rounded-full py-2 px-4">Back</button>
            </div>
            <div id="room" class="bg-amber-500/80 h-full w-1/2 flex flex-col items-center justify-center gap-2 border-x-2 border-amber-300" hidden>
                <div class="flex bg-white rounded-full space-x-2 py-2 px-4">
                    <div>My ID: </div>
                    <div id="MyID">My ID</div>
                </div>
                <div id="usersList" class="flex flex-col gap-2"></div>
                <button type="button" @click="$store.homePage.startMultiplayer()" class="cursor-pointer bg-white rounded-full py-2 px-4">Start</button>
                <button type="button" @click="$store.homePage.closeRoom()" class="cursor-pointer bg-white rounded-full py-2 px-4">Close Room</button>
                <button type="button" @click="$store.homePage.setMultiPlayerPage()" class="cursor-pointer bg-white rounded-full py-2 px-4">Back</button>
            </div>
        `
        return element;
    }

    private setPage(id: string): void {
        this.previousID = this.currentID;
        this.currentID = id;
        document.getElementById(this.previousID)?.setAttribute("hidden", "");
        document.getElementById(this.currentID)?.removeAttribute("hidden");
    }
}