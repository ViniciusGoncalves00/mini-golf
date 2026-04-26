import { Room } from "../room";
import { MessageBuilder } from "./message-builder";
import { PeerNetwork } from "./PeerNetwork";

export class MessageHandler {
    public static dispatchStartGame(network: PeerNetwork): void {
        const message = MessageBuilder.startGameMessage();
        network.send(message);
    }

    public static dispatchRoom(network: PeerNetwork, room: Room): void {
        const message = MessageBuilder.roomMessage(room);
        network.send(message);
    }

    public static receiveRoom(data: any): Room {
        return Room.fromJSON(data.payload);
    }
}