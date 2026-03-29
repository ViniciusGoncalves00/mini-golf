import { User } from "../user";
import { NetworkMessage } from "./networkMessage";
import { Transport } from "./transports";

export class Server<T> {
    private transport: Transport<T>;

    public constructor(transport: Transport<T>) {
        this.transport = transport;

        this.transport.onMessage((peerId: string, message: NetworkMessage) => {
            this.handleMessage(peerId, message);
        });
    }

    public handleMessage(peerId: string, message: NetworkMessage) {
    }
}