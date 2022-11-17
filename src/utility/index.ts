export * from "./hex";
export * from "./defaultedmap";

export function sum(list: number[]) {
    return list.reduce((a, b) => a + b, 0);
}