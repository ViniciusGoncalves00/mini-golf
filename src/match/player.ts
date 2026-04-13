import { Ball } from "./ball";
import { Builder } from "../builder";
import { Club } from "./club";
import { User } from "../user";
import { Monobehavior } from "../monobehavior";

export class Player extends Monobehavior {
    public isLoaded: boolean = false;

    public readonly ball: Ball = Builder.ball();
    public readonly club: Club = Builder.club(this.ball);

    public readonly user: User;

    public constructor(user: User) {
        super();

        this.user = user;
    }
}