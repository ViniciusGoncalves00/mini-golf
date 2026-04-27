import { Vector3 } from "three";
import { Room } from "../room";
import { User } from "../user";
import { SimpleMessage, PayloadMessage } from "./message";
import { NetworkMessagesType } from "./network-message";
import { ShotInfo } from "../match/shot-info";

export class MessageBuilder {
    public static startGameMessage(origin: User): any {
        const message = new SimpleMessage(crypto.randomUUID(), origin, Date.now(), NetworkMessagesType.MATCH_START);
        return message.toJSON();
    }

    public static fireShotMessage(origin: User, shotInfo: ShotInfo): any {
        const message = new PayloadMessage(
            crypto.randomUUID(),
            origin,
            Date.now(),
            NetworkMessagesType.SHOT_FIRE,
            shotInfo
        );
        return message.toJSON();
    }

    public static roomMessage(origin: User, room: Room): any {
        const message = new PayloadMessage(
            crypto.randomUUID(),
            origin,
            Date.now(),
            NetworkMessagesType.USER_LIST,
            room,
        )
        return message.toJSON();
    }
}