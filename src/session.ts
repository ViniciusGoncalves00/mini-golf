import { Match } from "./match/match";
import { User } from "./user";
import { PeerHost } from "./network/PeerHost";
import { PeerClient } from "./network/PeerClient";
import { StorageManager } from "./storageManager";
import { StorageKey } from "./common/enums";
import { ID } from "./common/ID";
import { Name } from "./common/Name";
import { SinglePlayerMatch } from "./match/singleplayer-match";
import { level3 } from "./course/courses";
import { Room } from "./room";
import { NetworkHostMessage, NetworkMessagesTypes } from "./network/networkMessage";

export class Session {
    public readonly user: User;

    private network: PeerHost | PeerClient | null = null;
    private match: Match | null = null;
    private matchHandler: (() => void) | null = null;
    public room: Room | null = null;
    
    public constructor() {
        const userData = StorageManager.instance().load(StorageKey.USER);
        this.user = userData ? User.load(userData) : new User(ID.generate(), Name.generate());
    }

    public save(): void {
        StorageManager.instance().save(StorageKey.SESSION, this);
    }

    public startMatch(): void {
        const courses = [level3()];

        setTimeout(() => {
            const canvas = document.getElementById("game")!;
            this.match = new SinglePlayerMatch(canvas, courses, [this.user]);
            this.match.start();
        }, (100));
    }

    public createRoom(): void {
        this.network = new PeerHost(this.user);
        this.room = new Room(this.user.getID(), [this.user]);

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