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
        const network = this.network as PeerNetwork;

        const courses = [level1()];

        const canvas = document.getElementById("game")!;
        this.match = new MultiPlayerMatch(canvas, courses, this.room.users, this.user);
        this.match.start();

        const match = this.match as MultiPlayerMatch; 

        if (this.room.host?.isEquals(this.user)) {
            MessageHandler.dispatchStartGame(network, this.user);
            
            match.club.onFreeShot.push((force) => {
                match.applyForce(this.user, force);
                MessageHandler.dispatchFireShot(network, this.user, this.user, force);
            })

            network.onReceiveData.push((peerId, data) => {
                switch (data.type) {
                    case NetworkMessagesType.SHOT_FIRE:
                        const shotInfo = MessageHandler.receiveFireShot(data);
                        match.applyForce(shotInfo.origin, shotInfo.force);
                        MessageHandler.dispatchFireShot(network, this.user, shotInfo.origin, shotInfo.force);
                        break;
                    default:
                        break;
                }
            });
        } else {
            match.club.onFreeShot.push((force) => {
                MessageHandler.dispatchFireShot(network, this.user, this.user, force);
            })
        }
    }

    public createRoom(): void {
        const network = this.network as PeerNetwork;

        // this.network = new PeerHost(this.user);
        this.room.setHost(this.user);
        this.room.addUser(this.user);

        const room = (Alpine.store("room") as Room);

        network.onPeerDisconnect.push((peerID) => {
            room.removeUser(peerID);
            MessageHandler.dispatchRoom(network, this.user, room);
        }
    );

        network.onPeerConnect.push((peerID) => {
            room.addUser(network.users.get(peerID)!);
            MessageHandler.dispatchRoom(network, this.user, room);
        })
    }

    public connectTo(peerID: string): void {
        const connected = this.network?.connectTo(peerID);
        if (!connected) return;

        const network = this.network as PeerNetwork;
        
        network.onReceiveData.push((peerId, data) => {
            switch (data.type) {
                case NetworkMessagesType.MATCH_START:
                    this.startMultiPlayerMatch();
                    (Alpine.store("pageManager") as PageManager).setPage(Page.GAME)
                    break;
                case NetworkMessagesType.SHOT_FIRE:
                    const shotInfo = MessageHandler.receiveFireShot(data);
                    (this.match as MultiPlayerMatch).applyForce(shotInfo.origin, shotInfo.force);
                    break;
                case NetworkMessagesType.USER_LIST:
                    const room = MessageHandler.receiveRoom(data);
                    (Alpine.store("room") as Room).setHost(room.host!);
                    (Alpine.store("room") as Room).setUsers(room.users);
                    break;
                default:
                    break;
            }
        });

        (Alpine.store("pageManager") as PageManager).setPage(Page.ROOM);
    }
}