import Peer, { DataConnection, PeerConnectOption } from "peerjs";
import { NetworkMessage, NetworkMessagesTypes } from "./networkMessage";
import { User } from "../user";
import { Player } from "../match/player";

export abstract class PeerNetwork {
    public onPeerConnect: ((peerID: string) => void)[] = [];
    public onPeerDisconnect: ((peerID: string) => void)[] = [];
    
    public onReceiveData: ((peerID: string, data: any) => void)[] = [];
    
    public readonly users = new Map<string, User>();
    public readonly peer: Peer;
    
    protected readonly user: User;
    protected readonly connections = new Map<string, DataConnection>();
    protected isReady = false;

    public constructor(user: User) {
        this.user = user;
        this.peer = new Peer(user.ID);

        this.peer.on("open", () => {
            console.log("Peer ID:", this.peer.id);
            this.isReady = true;

            const element = document.getElementById("MyID");
            if (element) element.innerText = this.peer.id;
        });

        this.peer.on("error", (err) => {
            console.error("Peer error:", err);
        });
    }

    public send(data: NetworkMessage) {
        for (const connection of this.connections.values()) {
            if (connection.open) connection.send(data);
        }
    }

    public disconnect(): void {
        this.peer.disconnect();
    }

    protected registerConnection(connection: DataConnection) {
        const peerID = connection.peer;

        if (this.connections.has(peerID)) return;
        
        this.connections.set(peerID, connection);
        
        connection.on("open", () => {
            console.log("Peer connected:", peerID);
            
            const metadata = connection.metadata || {};

            this.users.set(
                peerID,
                new User(
                    metadata.userID,
                    metadata.userName
                )
            );

            
            this.onPeerConnect.forEach(cb => cb(peerID));
            // connection.send({ type: NetworkMessagesTypes.CONNECTED });
        });

        connection.on("data", (data: any) => {
            console.log("Received:", data);
            this.onReceiveData.forEach(cb => cb(peerID, data));
        });

        connection.on("close", () => {
            console.log("Disconnected:", peerID);

            this.connections.delete(peerID);
            this.users.delete(peerID);
            this.onPeerDisconnect.forEach(cb => cb(peerID));
        });

        connection.on("error", (err) => {
            console.error("Connection error:", err);
        });
    }
}