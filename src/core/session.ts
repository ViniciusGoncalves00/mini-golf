import { User } from "./user";
import { PeerHost } from "./network/PeerHost";
import { PeerClient } from "./network/PeerClient";
import { StorageLoader } from "./storageLoader";
import { StorageKey } from "./common/enums";
import { ID } from "./common/ID";
import { Name } from "./common/Name";
import { level1, level3 } from "./course/courses";
import { Room } from "./room";
import { NetworkHostMessage, NetworkMessagesTypes } from "./network/networkMessage";
import { Match } from "./match/match";
import { MultiPlayerMatch } from "./match/multiplayer-match";
import { SinglePlayerMatch } from "./match/singleplayer-match";
import { PeerNetwork } from "./network/PeerNetwork";

export class Session {
    public readonly user: User;

    public network: PeerNetwork | null = null;
    public match: Match | null = null;
    public matchHandler: (() => void) | null = null;
    public room: Room = new Room();
    
    public constructor() {
        const userData = StorageLoader.instance().load(StorageKey.USER);
        this.user = userData ? User.load(userData) : new User(ID.generate(), Name.generate());
    }

    public loadNetwork(): void {
        this.network = new PeerNetwork(this.user);
    }

    public save(): void {
        StorageLoader.instance().save(StorageKey.SESSION, this);
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
            this.match = new MultiPlayerMatch(canvas, courses, this.room.users, this.user);
            this.match.start();
        }, (100));
    }

    public createRoom(): void {
        const network = this.network as PeerNetwork;

        // this.network = new PeerHost(this.user);
        this.room.setHost(this.user);
        this.room.addUser(this.user);

        network.onPeerDisconnect.push((peerID) => {
            const users: { ID: string; name: string }[] = [];

            this.room.users.forEach((user, index) => {
                users.push({
                    ID: user.getID().value,
                    name: user.getName().get()
                })
            });

            const message: NetworkHostMessage = {
                type: NetworkMessagesTypes.USER_LIST,
                payload: { users: users }
            }
            network.send(message);
        });

        network.onPeerConnect.push((peerID) => {
            console.log("Peer connected:", peerID);
            const users: { ID: string; name: string }[] = [];
            network.users.values().forEach((user, index) => {
                users.push({
                    ID: user.getID().value,
                    name: user.getName().get()
                })
            });
            users.push({
                ID: this.user.getID().value,
                name: this.user.getName().get()
            });

            const message: NetworkHostMessage = {
                type: NetworkMessagesTypes.USER_LIST,
                payload: { users: users }
            }

            this.room.addUser(network.users.get(peerID)!);
            network.send(message);
        })
    }

    public connectTo(peerID: string): void {
        this.network?.connectTo(peerID);
    }
}