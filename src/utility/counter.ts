export class Counter<T> {

    map: Map<T, number>;

    constructor(counts: Iterable<[T, number]> = []) {
        this.map = new Map(counts);
    }

    decrease(key: T) {
        if (!this.map.has(key)) throw new Error(`No count for key "${key}"`);
        this.map.set(key, this.map.get(key) - 1);
    }

    get(key: T): number | undefined {
        return this.map.get(key);
    }

}