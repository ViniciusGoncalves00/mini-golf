export class Name {
    private value: string;

    public constructor(value: string) {
        this.value = value;
    }

    public static generate(): Name {
        const precision = 4;
        const value = Math.random().toString().substring(2, 2 + precision);
        return new Name(`Guest ${value}`);
    }

    public get(): string {
        return this.value;
    }

    public set(name: string): void {
        this.value = name;
    }
}