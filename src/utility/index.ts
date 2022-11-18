export * from "./hex";
export * from "./defaultedmap";
export * from "./counter";

export function sum(list: number[]) {
    return list.reduce((a, b) => a + b, 0);
}