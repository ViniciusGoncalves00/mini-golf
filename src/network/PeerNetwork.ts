import Peer, { DataConnection } from "peerjs";
import { NetworkMessage } from "./networkMessage";

export class PeerNetwork {
    public readonly peer: Peer;
    private connections = new Map<string, DataConnection>();

    public onReceive: ((peerId: string, data: NetworkMessage) => void)[] = [];
    public onJoin: ((peerId: string) => void)[] = [];
    public onLeave: ((peerId: string) => void)[] = [];

    private isReady = false;

    constructor() {
        this.peer = new Peer();

        this.peer.on("open", (id) => {
            console.log("Peer ID:", id);
            this.isReady = true;

            const el = document.getElementById("MyID");
            if (el) el.innerText = id;
        });

        this.peer.on("connection", (conn) => {
            this.registerConnection(conn);
        });

        this.peer.on("error", (err) => {
            console.error("Peer error:", err);
        });
    }

    // 🔥 importante: só conecta se pronto
    public joinRoom(roomId: string) {
        if (!this.isReady) {
            console.warn("Peer ainda não está pronto");
            return;
        }

        if (roomId === this.peer.id) {
            console.warn("Tentativa de conectar em si mesmo");
            return;
        }

        if (this.connections.has(roomId)) {
            console.warn("Já conectado a esse peer");
            return;
        }

        console.log("Trying to join room:", roomId);

        const connection = this.peer.connect(roomId, {
            reliable: true
        });

        connection.on("open", () => {
            console.log("Connected to room:", roomId);
            this.registerConnection(connection);

            // handshake
            connection.send({ type: "connected" });
        });

        connection.on("error", (err) => {
            console.error("Connection error:", err);
        });
    }

    public send(data: NetworkMessage) {
        for (const conn of this.connections.values()) {
            if (conn.open) conn.send(data);
        }
    }

    public sendTo(peerId: string, data: NetworkMessage) {
        const conn = this.connections.get(peerId);
        if (conn?.open) conn.send(data);
    }

    public getRoomId() {
        return this.peer.id;
    }

    public getPeers(): string[] {
        return Array.from(this.connections.values().map(connection => connection.peer));
    }

    private registerConnection(connection: DataConnection) {
        const peerId = connection.peer;

        if (this.connections.has(peerId)) return;

        console.log("Player connected:", peerId);

        this.connections.set(peerId, connection);

        this.setupConnection(connection);

        this.onJoin.forEach(cb => cb(peerId));
    }

    private setupConnection(connection: DataConnection) {
        const peerId = connection.peer;

        connection.on("data", (data: any) => {
            console.log("Received:", data);

            this.onReceive.forEach(cb => cb(peerId, data));
        });

        connection.on("close", () => {
            console.log("Disconnected:", peerId);

            this.connections.delete(peerId);
            
            this.onLeave.forEach(cb => cb(peerId));
        });

        connection.on("error", (err) => {
            console.error("Connection error:", err);
        });
    }
}