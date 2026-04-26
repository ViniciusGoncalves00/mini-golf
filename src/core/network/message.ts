import { Room } from "../room";
import { NetworkMessage, NetworkMessagesType } from "./network-message";

export abstract class Message {
    public readonly ID: string;
    public readonly timestamp: number;
    public readonly type: NetworkMessagesType;

    public constructor(ID: string, timestamp: number, type: NetworkMessagesType) {
        this.ID = ID;
        this.timestamp = timestamp;
        this.type = type;
    }

    public toJSON(): any {
        return {
            ID: this.ID,
            timestamp: this.timestamp,
            type: this.type,
        }
    }
}

export class RoomDataMessage extends Message {
    public room: Room;

    public constructor(ID: string, timestamp: number, type: NetworkMessagesType, room: Room) {
        super(ID, timestamp, type);
        this.room = room;
    }

    public toJSON() {
        const obj = super.toJSON();
        obj.payload = this.room.toJSON();
        return obj;
    }
}