import { StorageManager } from "./storageManager";

export class User {
    public readonly id: string;
    public name: string;

    public constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    public setName(name: string): void {
        this.name = name;
        StorageManager.getInstance().save("user", this);
    }
}