import { Room } from "../room";
import { Message, RoomDataMessage } from "./message";
import { NetworkMessagesType } from "./network-message";

export class MessageBuilder {
    public static startGameMessage(): any {
        const message = new Message(crypto.randomUUID(), Date.now(), NetworkMessagesType.MATCH_START);
        return message.toJSON();
    }

    public static roomMessage(room: Room): any {
        const message = new RoomDataMessage(
            crypto.randomUUID(),
            Date.now(),
            NetworkMessagesType.USER_LIST,
            room,
        )
        return message.toJSON();
    }
}