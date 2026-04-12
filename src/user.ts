import { StorageManager } from "./storageManager";

export class User {
    public readonly ID: string;
    public name: string;

    public constructor(id?: string, name: string = "Guest") {
        this.name = name;
        this.ID = id ?? Math.round(Math.random() * 1000).toString();
    }

    public setName(name: string): void {
        this.name = name;
        StorageManager.getInstance().save("user", this);
    }

    public save(): void {
        StorageManager.getInstance().save("user", this);
    }
}