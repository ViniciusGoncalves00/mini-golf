import { Ball } from "./ball";
import { Builder } from "./builder";
import { Club } from "./club";
import { User } from "./user";

export class Player {
    public readonly ball: Ball = Builder.ball();
    public readonly club: Club = Builder.club(this.ball);

    public readonly user: User;

    public constructor(user: User) {
        this.user = user;
    }
}