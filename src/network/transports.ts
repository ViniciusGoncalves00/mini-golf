import { NetworkMessage } from "./networkMessage";

export abstract class Transport<T> {
    public readonly clients = new Map<string, T>();

    public onMessageCallback = (peerId: string, data: any) => {};
    public onConnectCallback = (peerId: string) => {};

    public abstract send(peerId: string, data: any): void;
    public abstract broadcast(data: any): void;
    public abstract onMessage(callback: (peerId: string, data: NetworkMessage) => void): void;
    public abstract onConnect(callback: (peerId: string) => void): void;
}

export class WebSocketTransport extends Transport<WebSocket> {
    public constructor(server: any) {
        super();

        server.on("connection", (ws: WebSocket) => {
            const id = crypto.randomUUID();
            this.clients.set(id, ws);

            this.onConnectCallback?.(id);
            ws.onmessage = (message) => {
                this.onMessageCallback?.(id, JSON.parse(message.toString()));
            };
        });
    }

    public send(peerId: string, data: NetworkMessage) {
        this.clients.get(peerId)?.send(JSON.stringify(data));
    }

    public broadcast(data: any) {
        for (const ws of this.clients.values()) {
            ws.send(JSON.stringify(data));
        }
    }

    public onMessage(callback: any) {
        this.onMessageCallback = callback;
    }

    public onConnect(callback: any) {
        this.onConnectCallback = callback;
    }
}

export class WebRTCTransport extends Transport<RTCDataChannel> {
    public constructor() {
        super();
    }

    public addPeer(peerId: string, channel: RTCDataChannel) {
        this.clients.set(peerId, channel);  

        channel.onmessage = (event) => {
            this.onMessageCallback?.(peerId, JSON.parse(event.data));
        };    

        this.onConnectCallback?.(peerId);
    }

    public send(peerId: string, data: NetworkMessage) {
        this.clients.get(peerId)?.send(JSON.stringify(data));
    }

    public broadcast(data: any) {
        for (const channel of this.clients.values()) {
            channel.send(JSON.stringify(data));
        }
    }

    public onMessage(callback: any) {
        this.onMessageCallback = callback;
    }

    public onConnect(callback: any) {
        this.onConnectCallback = callback;
    }
}