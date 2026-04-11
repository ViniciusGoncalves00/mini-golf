import { Page } from "../ui/page";
import { State } from "./state";

export class Context {
    public get state(): State { return this.state }
    
    private _state: State | null = null;

    public setState(state: State): void {
        this._state?.leaveState();
        this._state = state;
        this._state?.enterState();
    }
}