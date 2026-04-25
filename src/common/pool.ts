export class Pool<T> {
    private free: T[] = [];
    private readonly factory: () => T;
    private readonly maxSize: number;
    private borrowed: number = 0;

    public constructor(factory: (value?: any) => T, maxSize: number = Infinity) {
        this.factory = factory;
        this.maxSize = maxSize;
    }

    /**
     * Acquires an item from the pool.
     * Creates a new one if none are free.
     * 
     * @returns Returns a borrowed object or null if maxSize is reached (if setted) and there are no object free to borrow.
     */
    public acquire(): T | null {
        if (this.free.length === 0 && this.borrowed === this.maxSize) return null;
        this.borrowed++;
        return this.free.pop() ?? this.factory();
    }

    /**
     * Returns an item back to the pool.
     */
    public release(item: T): void {
        this.free.push(item);
        this.borrowed--;
    }

    /**
     * Clears all pooled items.
     */
    public clear(): void {
        this.free.length = 0;
        this.borrowed = 0;
    }

    /**
     * Number of free items.
     */
    public size(): number {
        return this.free.length;
    }
}
