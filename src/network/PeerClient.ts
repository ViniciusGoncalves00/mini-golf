import { PeerConnectOption } from "peerjs";
import { User } from "../user";
import { PeerNetwork } from "./PeerNetwork";

export class PeerClient extends PeerNetwork {
    private readonly maxConnections: number = 1;

    public constructor(user: User) {
        super(user);
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

        if (this.connections.size >= this.maxConnections) {
            console.warn("Maximum number of connections reached.");
            return;
        }

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
}