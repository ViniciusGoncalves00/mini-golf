import { User } from "../user";
import { UserListMessage } from "./message";
import { NetworkMessagesType } from "./network-message";

export class MessageBuilder {
    public static userList(users: User[]): any {
        const message = new UserListMessage(
            crypto.randomUUID(),
            Date.now(),
            NetworkMessagesType.USER_LIST,
            users,
        )
        return message.toJSON();
    }
}