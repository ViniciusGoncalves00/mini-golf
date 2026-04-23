import { StorageKey } from "./common/enums";
import { ID } from "./common/ID";
import { Name } from "./common/Name";
import { StorageLoader } from "./storageLoader";

export class User {
    private readonly ID: ID;
    private readonly name: Name;

    public constructor(id: ID, name: Name) {
        this.name = name;
        this.ID = id;

        this.save();
    }

    public save(): void {
        StorageLoader.instance().save(StorageKey.USER, this);
    }

    public static load(data: any): User {
        const id = data?.ID?.value ? new ID(data?.ID.value) : ID.generate();
        const name = data?.name?.value ? new Name(data.name.value) : Name.generate();

        return new User(id, name);
    }

    public getName(): Name {
        return this.name;
    }

    public getID(): ID {
        return this.ID;
    }

    public setName(name: string): void {
        this.name.set(name);
        StorageLoader.instance().save(StorageKey.USER, this);
    }
}