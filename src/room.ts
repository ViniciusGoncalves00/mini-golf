import { ID } from "./common/ID";
import { User } from "./user";

export class Room {
    public hostID: ID;
    public users: User[] = [];

    public constructor(hostID: ID, users: User[] = []) {
        this.hostID = hostID;
        this.users = users;
    }
}