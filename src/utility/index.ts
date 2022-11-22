export * from "./hex";
export * from "./ortho";
export * from "./shader";
export * from "./counter";
export * from "./async";

export function sum(list: number[]) {
    return list.reduce((a, b) => a + b, 0);
}

export function getOrInsert<K, V>(map: Map<K, V>, key: K, factory: () => V): V {
    if (map.has(key)) return map.get(key);
    const value = factory();
    map.set(key, value);
    return value;
}