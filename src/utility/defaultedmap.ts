export class DefaultedMap<K, V> implements Map<K, V> {

    map: Map<K, V>;
    factory: () => V;

    constructor(factory: () => V) {
        this.map = new Map<K, V>();
        this.factory = factory;
    }

    clear(): void {
        this.map.clear();
    }

    delete(key: K): boolean {
        return this.map.delete(key);
    }

    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        this.map.forEach(callbackfn);
    }

    get(key: K): V {
        let value = this.map.get(key);
        if (value === undefined) {
            value = this.factory();
            this.map.set(key, value);
        }
        return value;
    }

    has(key: K): boolean {
        return this.map.has(key);
    }

    set(key: K, value: V): this {
        this.map.set(key, value);
        return this;
    }

    size: number;

    entries(): IterableIterator<[K, V]> {
        return this.map.entries();
    }

    keys(): IterableIterator<K> {
        return this.map.keys();
    }
    values(): IterableIterator<V> {
        return this.map.values();
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.map[Symbol.iterator]();
    }

    [Symbol.toStringTag]: string;

}