import { User } from "../user";
import { NetworkMessage } from "./network-message";
import { PeerNetwork } from "./PeerNetwork";

export class PeerHost extends PeerNetwork {
    public constructor(user: User) {
        super(user);

        this.peer.on("connection", (conn) => {
            this.registerConnection(conn);
        });
    }

    public getPeersIDsList(): string[] {
        return Array.from(this.connections.values().map(connection => connection.peer));
    }

    public sendTo(peerID: string, data: NetworkMessage) {
        const connection = this.connections.get(peerID);
        if (connection?.open) connection.send(data);
    }
}