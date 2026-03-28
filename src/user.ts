import { StorageManager } from "./storageManager";

export class User {
    public name: string;

    private constructor(name: string) {
        this.name = name;
    }

    public setName(name: string): void {
        this.name = name;
        StorageManager.getInstance().save("user", this);
    }

    public static fromJSON(data: any): User {
        return new User(data.name ?? "Guest");
    }
}