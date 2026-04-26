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
    }

    public save(): void {
        StorageLoader.instance().save(StorageKey.USER, this.toJSON());
    }

    public static fromJSON(data: any): User {
        const id = data?.ID ? ID.load(data.ID) : ID.generate();
        const name = data?.name ? Name.load(data.name) : Name.generate();

        return new User(id, name);
    }

    public toJSON(): any {
        return {
            ID: this.ID.get(),
            name: this.name.get(),
        }
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