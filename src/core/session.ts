import { User } from "./user";
import { PeerHost } from "./network/PeerHost";
import { PeerClient } from "./network/PeerClient";
import { StorageLoader } from "./storageLoader";
import { StorageKey } from "./common/enums";
import { ID } from "./common/ID";
import { Name } from "./common/Name";
import { level1, level3 } from "./course/courses";
import { Room } from "./room";
import { NetworkHostMessage, NetworkMessagesType } from "./network/network-message";
import { Match } from "./match/match";
import { MultiPlayerMatch } from "./match/multiplayer-match";
import { SinglePlayerMatch } from "./match/singleplayer-match";
import { PeerNetwork } from "./network/PeerNetwork";
import Alpine from 'alpinejs';
import { Page, PageManager } from "@/ui/page";
import { MessageHandler } from "./network/message-handler";

export class Session {
    public readonly user: User;

    public network: PeerNetwork | null = null;
    public match: Match | null = null;
    public matchHandler: (() => void) | null = null;
    public room: Room = new Room();
    
    public constructor() {
        const userData = StorageLoader.instance().load(StorageKey.USER);
        this.user = userData ? User.fromJSON(userData) : new User(ID.generate(), Name.generate());
        this.user.save();
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
                    ID: user.getID().get(),
                    name: user.getName().get()
                })
            });

            const message: NetworkHostMessage = {
                type: NetworkMessagesType.USER_LIST,
                payload: { users: users }
            }
            network.send(message);
        });

        network.onPeerConnect.push((peerID) => {
            this.room.addUser(network.users.get(peerID)!);
            MessageHandler.dispatchUserList(network, this.user);
        })
    }

    public connectTo(peerID: string): void {
        const connected = this.network?.connectTo(peerID);
        if (!connected) return;

        const network = this.network as PeerNetwork;
        network.onReceiveData.push((peerId, data) => {
            switch (data.type) {
                case NetworkMessagesType.MATCH_START:
                    (Alpine.store("pageManager") as PageManager).setPage(Page.GAME)
                    break;
                case NetworkMessagesType.USER_LIST:
                    const users = MessageHandler.receiveUserList(data);
                    (Alpine.store("room") as Room).setUsers(users);
                    break;
                default:
                    break;
            }
        });

        (Alpine.store("pageManager") as PageManager).setPage(Page.ROOM);
    }
}