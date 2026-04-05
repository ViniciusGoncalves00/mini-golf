import Peer from "peerjs";
import * as THREE from "three";
import { level1, level3 } from "./course/courses";
import { Match } from "./match";
import { Page } from "./pages/page";
import { StorageManager } from "./storageManager";
import { User } from "./user";
import { PeerNetwork } from "./network/PeerNetwork";
import { Player } from "./player";
import { StorageKey } from "./common/enums";
import { PeerHost } from "./network/PeerHost";
import { PeerClient } from "./network/PeerClient";
import { NetworkHostMessage, NetworkMessagesTypes } from "./network/networkMessage";

export class Session {
    public readonly user: User;
    public readonly page: Page;

    private network: PeerHost | PeerClient | null = null;
    private match: Match | null = null;
    
    public constructor() {
        const user = StorageManager.getInstance().load(StorageKey.USER);
        this.user = new User(undefined, user.name);
        this.page = new Page();

        this.page.onStartSingleplayer = () => this.startSinglePlayerMatch();
        this.page.onStartMultiplayer = () => this.startMultiplayerMatch();
        this.page.onCreateRoom = () => this.createRoom();
        this.page.onCloseRoom = () => this.closeRoom();
        this.page.onJoinRoom = (peerID) => this.connecTo(peerID);
    }

    public startSinglePlayerMatch(): void {
        this.page.setGamePage();
        this.page.hideInterface();
        const player = new Player(this.user);
        const courses = [level3()];
        this.match = new Match(document.getElementById("game")!, player, [player], courses);

        player.club.onFreeShot.push((force) => {
            player.ball.rigidBody.applyForce(force);
        })
    }

    public startMultiplayerMatch(): void {
        if (!this.network) return;

        const message: NetworkHostMessage = {
            type: NetworkMessagesTypes.MATCH_START,
        }
        this.network.send(message);

        this.page.setGamePage();
        this.page.hideInterface();

        const localPlayer: Player = new Player(this.user);
        const allPlayers: Player[] = Array.from(this.network.players.values());
        allPlayers.push(localPlayer);

        const courses = [level1()];
        this.match = new Match(document.getElementById("game")!, localPlayer, allPlayers, courses);
    }

    public createRoom(): void {
        this.network = new PeerHost(this.user);

        const network = this.network as PeerHost;
        network.peer.on("open", () => {
            this.setupHostCallbacks();
        })
    }

    public closeRoom(): void {
        this.network?.disconnect();
        this.page.setMultiPlayerPage();
    }

    public connecTo(peerID: string): void {
        this.network = new PeerClient(this.user);

        const network = this.network as PeerClient;
        network.peer.on("open", () => {
            this.setupClientCallbacks();
            network.connectTo(peerID);
            this.page.setRoomPage();
        })
    }

    public setupHostCallbacks(): void {
        const localPlayer: Player = new Player(this.user);
        this.page.updatePlayerList([localPlayer.user]);

        const network = this.network as PeerHost;

        network.onPeerDisconnect.push((peerID) => {
            const players = Array.from(network.players.values());
            players.push(localPlayer);
            const data: { ID: string, name: string }[] = [];
            players.map(player => data.push({ID: player.user.ID, name: player.user.name }));

            const message: NetworkHostMessage = {
                type: NetworkMessagesTypes.PLAYERS_LIST,
                payload: { players: data }
            }
            network.send(message);
                
            this.page.updatePlayerList(data);
        });

        network.onPeerConnect.push((peerID) => {
            const players = Array.from(network.players.values());
            players.push(localPlayer);
            const data: { ID: string, name: string }[] = [];
            players.map(player => data.push({ID: player.user.ID, name: player.user.name }));

            const message: NetworkHostMessage = {
                type: NetworkMessagesTypes.PLAYERS_LIST,
                payload: { players: data }
            }

            network.send(message);
            this.page.updatePlayerList(data);
        })
        
        network.onReceiveData.push((peerID, data) => {
            switch (data.type) {
                // case NetworkMessagesTypes.CONNECTED:
                //     var players = network.players.values().toArray();
                //     var message: NetworkHostMessage = {
                //         type: NetworkMessagesTypes.PLAYERS_LIST,
                //         payload: { players: players },
                //     }
                    
                //     network.send(message);
                //     this.page.updatePlayerList(players);

                //     var player = network.players.get(peerID);
                //     player?.club.onFreeShot.push((force) => {
                //         const message: NetworkHostMessage = {
                //             type: NetworkMessagesTypes.SHOT_FIRE,
                //             payload: { vector: [force.x, force.y, force.z] },
                //         }

                //         network.send(message);
                //     })
                // case NetworkMessagesTypes.DISCONNECTED:
                //     var players = network.players.values().toArray();
                //     var message: NetworkHostMessage = {
                //         type: NetworkMessagesTypes.PLAYERS_LIST,
                //         payload: { players: players },
                //     }
                    
                //     network.send(message);
                //     this.page.updatePlayerList(players)
                //     break;
                case NetworkMessagesTypes.SHOT_FIRE:
                    if (!this.match) return;

                    const message: NetworkHostMessage = {
                        type: NetworkMessagesTypes.SHOT_FIRE,
                        payload: { vector: data.payload.vector },
                    }
                    
                    network.send(message);

                    const player = this.match.players.find(player => player.user.ID === peerID);
                    if (!player) return;

                    player.ball.rigidBody.applyForce(new THREE.Vector3(...data.payload.vector));
                default:
                    break;
            }
        })
    }

    public setupClientCallbacks(): void {
        // const player = network.players.get(peerID);
        // player?.club.onFreeShot.push((force) => {
        //     const message: NetworkHostMessage = {
        //         type: NetworkMessagesTypes.SHOT_FIRE,
        //         payload: { vector: [force.x, force.y, force.z] },
        //     }

        //     network.send(message);
        // })

        this.network?.onReceiveData.push((peerId, data) => {
            if (!this.network) return; 

            console.log("Client Received:", data)

            switch (data.type) {
                case NetworkMessagesTypes.MATCH_START:
                    this.startMultiplayerMatch();
                    break;
                case NetworkMessagesTypes.PLAYERS_LIST:
                    this.page.updatePlayerList(data.payload.players);
                    break;
                case NetworkMessagesTypes.SHOT_FIRE:
                    if (!this.match) return;
                    
                    const player = this.match.players.find(player => player.user.ID === peerId);
                    if (!player) return;

                    player.ball.rigidBody.applyForce(new THREE.Vector3(...data.payload.vector));
                    break;
                default:
                    break;
            }
        })
    }
}