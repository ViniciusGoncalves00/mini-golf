import { Room } from "../room";
import { User } from "../user";
import { MessageBuilder } from "./message-builder";
import { PeerNetwork } from "./PeerNetwork";

export class MessageHandler {
    public static dispatchRoomData(network: PeerNetwork, room: Room): void {
        const message = MessageBuilder.roomData(room);
        network.send(message);
    }

    public static receiveRoomData(data: any): Room {
        return Room.fromJSON(data.payload);
    }
}