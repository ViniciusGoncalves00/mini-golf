import Peer from "peerjs";
import * as THREE from "three";
import { level1, level3 } from "./course/courses";
import { Match } from "./match";
import { Server } from "./network/server";
import { WebRTCTransport, WebSocketTransport } from "./network/transports";
import { Page } from "./pages/page";
import { StorageManager } from "./storageManager";
import { User } from "./user";
import { PeerNetwork } from "./network/PeerNetwork";
import { Player } from "./player";

export class Session {
    public readonly user: User;
    public readonly page: Page;

    private network: PeerNetwork;
    private match: Match | null = null;
    
    public constructor() {
        this.network = new PeerNetwork();

        const user = StorageManager.getInstance().load("user");
        this.user = new User(this.network.peer.id, user?.name ?? "Guest");

        this.page = new Page();

        this.page.onStartSingleplayer = () => this.startSinglePlayerMatch();
        this.page.onStartMultiplayer = () => this.startMultiplayerMatch();
        this.page.onCreateRoom = () => this.createRoom();
        this.page.onCloseRoom = () => this.closeRoom();
        this.page.onConnect = (roomID) => this.joinRoom(roomID);
    }

    public startSinglePlayerMatch(): void {
        this.page.setGamePage();
        this.page.hideInterface();
        const player = new Player(this.user);
        const courses = [level3()];
        this.match = new Match(document.getElementById("game")!, player, [player], courses);

        player.club.onFreeShot.push((force) => {
            console.log("Shot force:", force);
            player.ball.rigidBody.applyForce(force);
        })
    }

    public startMultiplayerMatch(): void {
        this.network.send({ type: "start" })

        this.page.setGamePage();
        this.page.hideInterface();

        const localPlayer: Player = new Player(this.user);
        const allPlayers: Player[] = this.network.getPeersList().map(peerId => new Player(new User(peerId, "Player " + peerId.substring(0, 5))));
        allPlayers.push(localPlayer);

        const courses = [level1()];
        this.match = new Match(document.getElementById("game")!, localPlayer, allPlayers, courses);

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
            const peers = this.network.getPeersList();
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
                    const peers = this.network.getPeersList();
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

                    const player = this.match.players.find(player => player.user.id === peerId);
                    if (!player) return;
                    
                    player.ball.rigidBody.applyForce(new THREE.Vector3(...data.payload.vector));
                default:
                    break;
            }
        })
    }

    public setupClientConnection(): void {
        this.network.onReceive.push((peerId, data) => {
            switch (data.type) {
                case "start":
                    this.startMultiplayerMatch();
                    break;
                case "playersList":
                    this.page.updatePlayerList(data.payload.players);
                    break;
                case "shot":
                    if (!this.match) return;
                    
                    const player = this.match.players.find(player => player.user.id === peerId);
                    if (!player) return;

                    player.ball.rigidBody.applyForce(new THREE.Vector3(...data.payload.vector));
                    break;
                default:
                    break;
            }
        })
    }
}