import { Room } from "../room";
import { User } from "../user";
import { NetworkMessage, NetworkMessagesType } from "./network-message";

export class SimpleMessage {
    public readonly ID: string;
    public readonly origin: User;
    public readonly timestamp: number;
    public readonly type: NetworkMessagesType;

    public constructor(ID: string, origin: User, timestamp: number, type: NetworkMessagesType) {
        this.ID = ID;
        this.origin = origin;
        this.timestamp = timestamp;
        this.type = type;
    }

    public toJSON(): any {
        return {
            ID: this.ID,
            origin: this.origin.toJSON(),
            timestamp: this.timestamp,
            type: this.type,
        }
    }
}

export class PayloadMessage extends SimpleMessage {
    public data: any;

    public constructor(ID: string, origin: User, timestamp: number, type: NetworkMessagesType, data: any) {
        super(ID, origin, timestamp, type);
        this.data = data;
    }

    public toJSON() {
        const obj = super.toJSON();
        obj.payload = this.data.toJSON();
        return obj;
    }
}