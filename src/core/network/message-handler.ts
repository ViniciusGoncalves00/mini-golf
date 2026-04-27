import { Vector3 } from "three";
import { Room } from "../room";
import { User } from "../user";
import { MessageBuilder } from "./message-builder";
import { PeerNetwork } from "./PeerNetwork";
import { ShotInfo } from "../match/shot-info";

export class MessageHandler {
    public static dispatchStartGame(network: PeerNetwork, origin: User): void {
        const message = MessageBuilder.startGameMessage(origin);
        network.send(message);
    }

    public static dispatchFireShot(network: PeerNetwork, origin: User, target: User, force: Vector3): void {
        const message = MessageBuilder.fireShotMessage(origin, new ShotInfo(target, force));
        network.send(message);
    }

    public static receiveFireShot(data: any): ShotInfo {
        return ShotInfo.fromJSON(data.payload);
    }

    public static dispatchRoom(network: PeerNetwork, origin: User, room: Room): void {
        const message = MessageBuilder.roomMessage(origin, room);
        network.send(message);
    }

    public static receiveRoom(data: any): Room {
        return Room.fromJSON(data.payload);
    }
}