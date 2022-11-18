export interface Counter<T> {
    new(entries?: Iterable<[T, number]>);
    set(key: T, value: number);
    get(key: T): number;
    increment(key: T): void;
    decrement(key: T): void;
}

export class Counter<T> implements Counter<T> {

    map: Map<T, number>;

    constructor(entries: Iterable<[T, number]> = []) {
        this.map = new Map(entries);
    }

    set(key: T, value: number) {
        this.map.set(key, value);
    }

    get(key: T): number {
        return this.map.get(key) || 0;
    }

    increment(key: T, amount = 1): void {
        this.map.set(key, this.get(key) + amount);
    }

    decrement(key: T, amount = 1): void {
        this.increment(key, -amount);
    }

    [Symbol.iterator]() {
        return this.map.entries();
    }

}