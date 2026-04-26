import { User } from "./user";

export class Room {
    public host: User | null = null;
    public users: User[] = [];

    public constructor(host: User | null = null, users: User[] = []) {
        this.host = host;
        this.users = users;
    }

    public setHost(user: User): void {
        this.host = user;
    }

    public addUser(user: User): void {
        if (this.users.find(u => u.getID().get() === user.getID().get())) return;

        // this.users = [...this.users, user];
        this.users.push(user);
    }
}