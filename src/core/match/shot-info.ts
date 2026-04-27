import { Vector3 } from "three";
import { User } from "../user";

export class ShotInfo {
    public readonly origin: User;
    public readonly force: Vector3;

    public constructor(origin: User, force: Vector3) {
        this.origin = origin;
        this.force = force;
    }

    public toJSON(): any {
        return {
            origin: this.origin.toJSON(),
            force: this.force.toArray(),
        }
    }

    public static fromJSON(data: any): ShotInfo {
        return new ShotInfo(
            User.fromJSON(data.origin),
            new Vector3().fromArray(data.force),
        )
    }
}