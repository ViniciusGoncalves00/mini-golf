import { Session } from "../session";

export abstract class State {
    protected session: Session;

    public constructor(session: Session) {
        this.session = session;
    }

    public enterState(): void {}
    public leaveState(): void {}
}