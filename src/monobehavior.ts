export abstract class Monobehavior {
    public onEnable: (() => void)[] = [];
    public onDisable: (() => void)[] = [];

    public start(): void {}
    public update(delta: number): void {}

    private _enabled: boolean = true;

    public enabled(): boolean {
        return this._enabled;
    }
    
    public enable(): void {
        this._enabled = true;
        for (const callback of this.onEnable) callback();
    }

    public disable(): void {
        this._enabled = false;
        for (const callback of this.onDisable) callback();
    }
}