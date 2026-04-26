export class Name {
    private _value: string;

    public constructor(value: string) {
        this._value = value;
    }

    public static generate(): Name {
        const precision = 4;
        const value = Math.random().toString().substring(2, 2 + precision);
        return new Name(`Guest ${value}`);
    }
    
    public static load(value: string): Name {
        return new Name(value);
    }

    public get(): string {
        return this._value;
    }

    public set(name: string): void {
        this._value = name;
    }
}