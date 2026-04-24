export class Pool<T> {
    private free: T[] = [];
    private readonly factory: () => T;

    public constructor(factory: (value?: any) => T) {
        this.factory = factory;
    }

    /**
     * Acquires an item from the pool.
     * Creates a new one if none are free.
     */
    public acquire(): T {
        return this.free.pop() ?? this.factory();
    }

    /**
     * Returns an item back to the pool.
     */
    public release(item: T): void {
        this.free.push(item);
    }

    /**
     * Clears all pooled items.
     */
    public clear(): void {
        this.free.length = 0;
    }

    /**
     * Number of free items.
     */
    public size(): number {
        return this.free.length;
    }
}
