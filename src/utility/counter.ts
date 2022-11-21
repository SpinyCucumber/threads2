export class Counter<T> {

    map: Map<T, number>;

    constructor(counts: Iterable<[T, number]> = []) {
        this.map = new Map(counts);
    }

    decrease(key: T): number {
        if (!this.map.has(key)) throw new Error(`No count for key "${key}"`);
        const decreased = this.map.get(key) - 1;
        this.map.set(key, decreased);
        return decreased;
        
    }

    get(key: T): number | undefined {
        return this.map.get(key);
    }

}