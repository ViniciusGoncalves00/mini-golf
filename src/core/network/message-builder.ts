import { Room } from "../room";
import { RoomDataMessage } from "./message";
import { NetworkMessagesType } from "./network-message";

export class MessageBuilder {
    public static roomData(room: Room): any {
        const message = new RoomDataMessage(
            crypto.randomUUID(),
            Date.now(),
            NetworkMessagesType.USER_LIST,
            room,
        )
        return message.toJSON();
    }
}