export class ID {
    private readonly _value: string;

    public constructor(value: string) {
        this._value = value;
    }

    public static generate(): ID {
        const precision = 3;
        const value = Math.random().toString().substring(2, 2 + precision);
        return new ID(value);
    }

    public static load(data: any): ID {
        return new ID(data._value);
    }

    public get(): string {
        return this._value;
    }
}