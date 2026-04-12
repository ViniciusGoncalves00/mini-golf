import * as THREE from "three";
import Alpine from 'alpinejs';

import { NetworkHostMessage, NetworkMessagesTypes } from "../network/networkMessage";
import { PeerClient } from "../network/PeerClient";
import { PeerHost } from "../network/PeerHost";
import { Session } from "../session";
import { State } from "./state";
import { HomePage } from "../ui/home-page";

export class HomeState extends State {
    public constructor(session: Session) {
        super(session);

        (Alpine.store("homePage") as HomePage).onStartSingleplayer = () => this.startSinglePlayerMatch();
        (Alpine.store("homePage") as HomePage).onStartMultiplayer = () => this.startMultiplayerMatch();
        (Alpine.store("homePage") as HomePage).onCreateRoom = () => this.createRoom();
        (Alpine.store("homePage") as HomePage).onCloseRoom = () => this.closeRoom();
        (Alpine.store("homePage") as HomePage).onJoinRoom = (peerID) => this.connecTo(peerID);
    }

    public enterState(): void {
        (Alpine.store("homePage") as HomePage).attach();
    }

    public leaveState(): void {
        (Alpine.store("homePage") as HomePage).dettach();
    }

    private startSinglePlayerMatch(): void {
        this.session.gameState.setMatchType("singleplayer");
        this.session.context.set(this.session.gameState);
    }
    
    private startMultiplayerMatch(): void {
        if (!this.session.network) return;

        this.session.gameState.setMatchType("multiplayer");
        this.session.context.set(this.session.gameState);
    }

    public createRoom(): void {
        this.session.network = new PeerHost(this.session.user);

        const network = this.session.network as PeerHost;
        network.peer.on("open", () => {
            this.setupHostCallbacks();
        })
    }

    public closeRoom(): void {
        this.session.network?.disconnect();
        (Alpine.store("homePage") as HomePage).setMultiPlayerPage();
    }

    public connecTo(peerID: string): void {
        this.session.network = new PeerClient(this.session.user);

        const network = this.session.network as PeerClient;
        network.peer.on("open", () => {
            this.setupClientCallbacks();
            network.connectTo(peerID);
            (Alpine.store("homePage") as HomePage).setRoomPage();
        })
    }

    public setupHostCallbacks(): void {
        (Alpine.store("homePage") as HomePage).setUsers([this.session.user]);

        const network = this.session.network as PeerHost;

        network.onPeerDisconnect.push((peerID) => {
            const users = Array.from(network.users.values());
            users.push(this.session.user);

            const message: NetworkHostMessage = {
                type: NetworkMessagesTypes.USER_LIST,
                payload: { users: users }
            }
            network.send(message);
                
            (Alpine.store("homePage") as HomePage).setUsers(users);
        });

        network.onPeerConnect.push((peerID) => {
            const users = Array.from(network.users.values());
            users.push(this.session.user);

            const message: NetworkHostMessage = {
                type: NetworkMessagesTypes.USER_LIST,
                payload: { users: users }
            }

            network.send(message);
            (Alpine.store("homePage") as HomePage).setUsers(users);
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
                //     this.homeState.page.updatePlayerList(players);

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
                //     this.homeState.page.updatePlayerList(players)
                //     break;
                case NetworkMessagesTypes.SHOT_FIRE:
                    if (!this.session.match) return;

                    const message: NetworkHostMessage = {
                        type: NetworkMessagesTypes.SHOT_FIRE,
                        payload: { vector: data.payload.vector },
                    }
                    
                    network.send(message);

                    const player = this.session.match.players.find(player => player.user.ID === peerID);
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

        this.session.network?.onReceiveData.push((peerId, data) => {
            if (!this.session.network) return; 

            console.log("Client Received:", data)

            switch (data.type) {
                case NetworkMessagesTypes.MATCH_START:
                    this.startMultiplayerMatch();
                    break;
                case NetworkMessagesTypes.USER_LIST:
                    (Alpine.store("homePage") as HomePage).setUsers(data.payload.users)
                    break;
                case NetworkMessagesTypes.SHOT_FIRE:
                    if (!this.session.match) return;
                    
                    const player = this.session.match.players.find(player => player.user.ID === peerId);
                    if (!player) return;

                    player.ball.rigidBody.applyForce(new THREE.Vector3(...data.payload.vector));
                    break;
                default:
                    break;
            }
        })
    }
}