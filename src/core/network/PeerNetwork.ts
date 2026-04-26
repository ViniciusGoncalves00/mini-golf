import Peer, { DataConnection, PeerConnectOption } from "peerjs";
import { NetworkMessage, NetworkMessagesTypes } from "./networkMessage";
import { User } from "../user";
import { ID } from "../common/ID";
import { Name } from "../common/Name";

export class PeerNetwork {
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
        this.peer = new Peer(user.getID().get());

        this.peer.on("open", () => {
            console.log("Peer ID:", this.peer.id);
            this.isReady = true;
        });

        this.peer.on("error", (err) => {
            console.error("Peer error:", err);
        });

        this.peer.on("connection", (conn) => {
            this.registerConnection(conn);
        });
    }

    public send(data: NetworkMessage) {
        for (const connection of this.connections.values()) {
            if (connection.open) connection.send(data);
        }
    }

    public sendTo(peerID: string, data: NetworkMessage) {
        const connection = this.connections.get(peerID);
        if (connection?.open) connection.send(data);
    }

    public connectTo(peerID: string) {
        if (!this.isReady) {
            console.warn("Peer is not ready yet.");
            return;
        }

        if (this.peer.id === peerID) {
            console.warn("Attempt to connect within oneself.");
            return;
        }

        if (this.connections.has(peerID)) {
            console.warn("Already connected to this peer.");
            return;
        }

        // if (this.connections.size >= this.maxConnections) {
        //     console.warn("Maximum number of connections reached.");
        //     return;
        // }

        console.log(`Trying to connect with ID: ${peerID}`);

        const options: PeerConnectOption = {
            label: this.peer.id,
            reliable: true,
            metadata: {
                userID: this.user.getID(),
                userName: this.user.getName(),
                timestamp: Date.now(),
            }
        }
        // this.peer.connect(peerID, options);
        const connection = this.peer.connect(peerID, options);
        this.registerConnection(connection);
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
                    new ID(metadata.userID),
                    new Name(metadata.userName)
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