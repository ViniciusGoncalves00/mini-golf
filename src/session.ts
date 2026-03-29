import Peer from "peerjs";
import { level1 } from "./course/courses";
import { Match } from "./match";
import { Server } from "./network/server";
import { WebRTCTransport, WebSocketTransport } from "./network/transports";
import { Page } from "./pages/page";
import { StorageManager } from "./storageManager";
import { User } from "./user";
import { PeerNetwork } from "./network/PeerNetwork";

export class Session {
    public readonly user: User;
    public readonly page: Page;

    public network: PeerNetwork;
    
    public constructor() {
        const user = StorageManager.getInstance().load("user");
        this.user = User.fromJSON(user);

        this.page = new Page();
        this.network = new PeerNetwork();

        this.page.onStart = () => this.start();
        this.page.onCreateRoom = () => this.createRoom();
        this.page.onCloseRoom = () => this.closeRoom();
        this.page.onConnect = (roomID) => this.joinRoom(roomID);
    }

    public start(): void {
        this.network.send({ type: "start" })

        this.page.setGamePage();
        this.page.hideInterface();

        const course = level1();
        const courses = [course];
        const match = new Match([this.user], courses);
    }

    public createRoom(): void {
        this.setupHostConnection();
        this.page.updatePlayerList([this.network.peer.id])
    }

    public closeRoom(): void {
        // this.network.connections.forEach(connection => connection.close());
        this.network.peer.destroy();
        this.page.setMultiPlayerPage();
    }

    public joinRoom(roomID: string): void {
        this.setupClientConnection();

        this.network.joinRoom(roomID);
        
        this.page.setRoomPage();
    }

    public setupHostConnection(): void {
        this.network.onLeave.push((peerId) => {
            const peers = this.network.getPeers();
            peers.push(this.network.peer.id);
                    
            this.network.send({
                type: "playersList",
                payload: {
                    players: peers,
                }
            });
                
            this.page.updatePlayerList(peers)
        });
        this.network.onReceive.push((peerId, data) => {
            switch (data.type) {
                case "connected":
                case "disconnected":
                    const peers = this.network.getPeers();
                    peers.push(this.network.peer.id);
                    
                    this.network.send({
                        type: "playersList",
                        payload: {
                            players: peers,
                        }
                    });
                
                    this.page.updatePlayerList(peers)
                    break;
                default:
                    break;
            }
        })
    }

    public setupClientConnection(): void {
        this.network.onReceive.push((peerId, data) => {
            switch (data.type) {
                case "start":
                    this.start();
                    break;
                case "playersList":
                    this.page.updatePlayerList(data.payload.players);
                    break;
                default:
                    break;
            }
        })
    }
}