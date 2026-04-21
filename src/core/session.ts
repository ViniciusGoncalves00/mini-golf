import { User } from "./user";
import { PeerHost } from "./network/PeerHost";
import { PeerClient } from "./network/PeerClient";
import { StorageManager } from "./storageManager";
import { StorageKey } from "./common/enums";
import { ID } from "./common/ID";
import { Name } from "./common/Name";
import { level1, level3 } from "./course/courses";
import { Room } from "./room";
import { NetworkHostMessage, NetworkMessagesTypes } from "./network/networkMessage";
import { Match } from "./match/match";
import { MultiPlayerMatch } from "./match/multiplayer-match";
import { SinglePlayerMatch } from "./match/singleplayer-match";

export class Session {
    public readonly user: User;

    public network: PeerHost | PeerClient | null = null;
    public match: Match | null = null;
    public matchHandler: (() => void) | null = null;
    public room: Room = new Room();
    
    public constructor() {
        const userData = StorageManager.instance().load(StorageKey.USER);
        this.user = userData ? User.load(userData) : new User(ID.generate(), Name.generate());
    }

    public save(): void {
        StorageManager.instance().save(StorageKey.SESSION, this);
    }

    public startSinglePlayerMatch(): void {
        const courses = [level3()];

        setTimeout(() => {
            const canvas = document.getElementById("game")!;
            this.match = new SinglePlayerMatch(canvas, courses, [this.user]);
            this.match.start();
        }, (100));
    }

    public startMultiPlayerMatch(): void {
        const courses = [level1()];

        setTimeout(() => {
            const canvas = document.getElementById("game")!;
            this.match = new MultiPlayerMatch(canvas, courses, [this.user, new User(ID.generate(), Name.generate())], this.user);
            this.match.start();
        }, (100));
    }

    public createRoom(): void {
        this.network = new PeerHost(this.user);
        this.room.setHost(this.user);
        this.room.addUser(this.user);

        this.network.peer.on("open", () => {
            this.network?.onPeerDisconnect.push((peerID) => {
                const users: { ID: string; name: string }[] = [];

                this.room?.users.forEach((user, index) => {
                    users.push({
                        ID: user.getID().value,
                        name: user.getName().get()
                    })
                });

                const message: NetworkHostMessage = {
                    type: NetworkMessagesTypes.USER_LIST,
                    payload: { users: users }
                }
                this.network?.send(message);
            });

        // network.onPeerConnect.push((peerID) => {
        //     const users = Array.from(network.users.values());
        //     users.push(this.session.user);

        //     const message: NetworkHostMessage = {
        //         type: NetworkMessagesTypes.USER_LIST,
        //         payload: { users: users }
        //     }

        //     network.send(message);
            
        //     (Alpine.store("homePage") as HomePage).setUsers(users);
        // })
        })
    }
}