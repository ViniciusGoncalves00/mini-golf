export class Storage {
    public constructor(private readonly baseKey: string) {}

    public get(key: string): string | null {
        return localStorage.getItem(this.storageKey(key))
    }

    public save(key: string, value: string) {
        localStorage.setItem(this.storageKey(key), value);
    }

    private storageKey(key?: string): string {
        return this.baseKey + ":" + key;
    }
}