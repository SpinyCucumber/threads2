import { Position, Vector } from "./ortho";

export * from "./hex";
export * from "./ortho";

export function sum(list: number[]) {
    return list.reduce((a, b) => a + b, 0);
}

export function getOrInsert<K, V>(map: Map<K, V>, key: K, factory: () => V): V {
    if (map.has(key)) return map.get(key);
    const value = factory();
    map.set(key, value);
    return value;
}

export function flatten(vertices: (Position | Vector)[]): Float32Array {
    const array = new Float32Array(2 * vertices.length);
    for (let i = 0; i < vertices.length; i++) {
        array[2*i] = vertices[i].x;
        array[2*i + 1] = vertices[i].y;
    }
    return array;
}