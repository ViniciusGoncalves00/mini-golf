import { User } from "../user";
import { MessageBuilder } from "./message-builder";
import { PeerNetwork } from "./PeerNetwork";

export class MessageHandler {
    public static dispatchUserList(network: PeerNetwork, host: User): void {
        const message = MessageBuilder.userList(
            Array.from(
                [...network.users.values(), host]
            )
        );
        network.send(message);
    }

    public static receiveUserList(data: any): User[] {
        const users = data.payload.users.map((user: any) => {
            return User.fromJSON(user);
        });
        console.log(users)
        return users;
    }
}