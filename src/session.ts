import Peer from "peerjs";
import * as THREE from "three";
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

    private network: PeerNetwork;
    private match: Match | null = null;
    
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
        this.match = new Match([this.user], courses);

        this.match.players.forEach(player => {
            player.club.onFreeShot.push((force) => {
                this.network.send({
                    type: "shot",
                    payload: {
                        vector: [force.x, force.y, force.z],
                    }
                });
            }
        )});
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
                case "shot":
                    if (!this.match) return;
                    this.network.send({
                        type: "shot",
                        payload: {
                            vector: data.payload.vector,
                        }
                    })
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
                case "shot":
                    this.match?.players[0].ball.rigidBody.applyForce(new THREE.Vector3(...data.payload.vector));
                    break;
                default:
                    break;
            }
        })
    }
}