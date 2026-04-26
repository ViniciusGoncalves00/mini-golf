import { User } from "./user";

export class Room {
    public host: User | null = null;
    public users: User[] = [];

    public constructor(host: User | null = null, users: User[] = []) {
        this.host = host;
        this.users = users;
    }

    public toJSON(): any {
        return {
            host: this.host?.toJSON(),
            users: this.users.map(user => (user.toJSON())),
        }
    }

    public static fromJSON(data: any): Room {
        return new Room(
            User.fromJSON(data.host),
            data.users.map((userData: any) => User.fromJSON(userData)),
        )
    }

    public setHost(user: User): void {
        this.host = user;
    }

    public addUser(user: User): void {
        if (this.users.find(u => u.getID().get() === user.getID().get())) return;
        this.users.push(user);
    }

    public setUsers(users: User[]): void {
        this.users.splice(0);
        this.users.push(...users);
    }
}