import { test } from "@jest/globals"
import { CubeVector, CubePosition, enumerateRing, enumerateSpiral, enumerateDirections, CubeToOrthoTransform } from "./hex";
import Immutable from "immutable";

test("should enumerate directions", () => {
    const directions = Array.from(enumerateDirections());
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

test("should support immutable map", () => {
    const map = Immutable.Map([
        [new CubePosition({ q: 4, r: -2, s: -2 }), 4],
        [new CubePosition({ q: 1, r: -2, s: 1 }), -2],
    ]);
    expect(map.get(new CubePosition({ q: 4, r: -2, s: -2 }))).toBe(4);
    expect(map.get(new CubePosition({ q: 1, r: -2, s: 1 }))).toBe(-2);
    expect(map.get(new CubePosition({ q: 0, r: 0, s: 0 }))).toBeUndefined();
});

test("should transform to ortho", () => {
    const transform = new CubeToOrthoTransform();
    const ortho = transform.transformPosition(new CubePosition({ q: 2, r: -1, s: 1 }));
    expect(ortho.x).toBeCloseTo(2.598);
    expect(ortho.y).toBeCloseTo(-1.5);
});