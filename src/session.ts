import { StorageManager } from "./storageManager";
import { User } from "./user";

export class Session {
    public readonly user: User;
    
    public constructor() {
        const user = StorageManager.getInstance().load("user");
        this.user = User.fromJSON(user);
    }
}