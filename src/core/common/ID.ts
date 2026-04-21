export class ID {
    public readonly value: string;

    public constructor(value: string) {
        this.value = value;
    }

    public static generate(): ID {
        const precision = 3;
        const value = Math.random().toString().substring(2, 2 + precision);
        return new ID(value);
    }
}