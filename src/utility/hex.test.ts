import { test } from "@jest/globals"
import { directions, CubeVector, CubePosition, enumerateRing, enumerateSpiral } from "./hex";

test("should enumerate directions", () => {
    expect(directions).toEqual([
        new CubeVector({ q: 1, r: 0, s: -1 }),
        new CubeVector({ q: -0, r: 1, s: -1 }),
        new CubeVector({ q: -1, r: 1, s: 0 }),
        new CubeVector({ q: -1, r: -0, s: 1 }),
        new CubeVector({ q: 0, r: -1, s: 1 }),
        new CubeVector({ q: 1, r: -1, s: -0 }),
    ]);
});

test("should enumerate ring", () => {
    const positions = Array.from(enumerateRing(new CubePosition({ q: 0, r: 0, s: 0 }), 1));
    expect(positions).toEqual([
        new CubePosition({ q: 0, r: -1, s: 1 }),
        new CubePosition({ q: 1, r: -1, s: 0 }),
        new CubePosition({ q: 1, r: 0, s: -1 }),
        new CubePosition({ q: 0, r: 1, s: -1 }),
        new CubePosition({ q: -1, r: 1, s: 0 }),
        new CubePosition({ q: -1, r: 0, s: 1 }),
    ]);
});

test("should enumerate spiral", () => {
    const positions = Array.from(enumerateSpiral(new CubePosition({ q: 0, r: 0, s: 0 }), 2));
    expect(positions).toEqual([
        new CubePosition({ q: 0, r: 0, s: 0 }),
        new CubePosition({ q: 0, r: -1, s: 1 }),
        new CubePosition({ q: 1, r: -1, s: 0 }),
        new CubePosition({ q: 1, r: 0, s: -1 }),
        new CubePosition({ q: 0, r: 1, s: -1 }),
        new CubePosition({ q: -1, r: 1, s: 0 }),
        new CubePosition({ q: -1, r: 0, s: 1 }),
        new CubePosition({ q: 0, r: -2, s: 2 }),
        new CubePosition({ q: 1, r: -2, s: 1 }),
        new CubePosition({ q: 2, r: -2, s: 0 }),
        new CubePosition({ q: 2, r: -1, s: -1 }),
        new CubePosition({ q: 2, r: 0, s: -2 }),
        new CubePosition({ q: 1, r: 1, s: -2 }),
        new CubePosition({ q: 0, r: 2, s: -2 }),
        new CubePosition({ q: -1, r: 2, s: -1 }),
        new CubePosition({ q: -2, r: 2, s: 0 }),
        new CubePosition({ q: -2, r: 1, s: 1 }),
        new CubePosition({ q: -2, r: 0, s: 2 }),
        new CubePosition({ q: -1, r: -1, s: 2 }),
    ]);
});