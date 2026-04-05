import { StorageManager } from "./storageManager";

export class User {
    public readonly ID: string;
    public name: string;

    public constructor(id?: string, name: string = "Guest") {
        this.name = name;
        this.ID = id ?? Math.round(Math.random() * 100).toString();
    }

    public setName(name: string): void {
        this.name = name;
        StorageManager.getInstance().save("user", this);
    }
}