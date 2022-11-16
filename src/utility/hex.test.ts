import { test } from "@jest/globals"
import { directions, CubeVector, CubePosition, enumerateRing, enumerateSpiral } from "./hex";

test("should enumerate directions", () => {
    expect(directions).toEqual([
        new CubeVector(1, 0, -1),
        new CubeVector(-0, 1, -1),
        new CubeVector(-1, 1, 0),
        new CubeVector(-1, -0, 1),
        new CubeVector(0, -1, 1),
        new CubeVector(1, -1, -0),
    ]);
});

test("should enumerate ring", () => {
    const positions = Array.from(enumerateRing(new CubePosition(0, 0, 0), 1));
    expect(positions).toEqual([
        new CubePosition(0, -1, 1),
        new CubePosition(1, -1, 0),
        new CubePosition(1, 0, -1),
        new CubePosition(0, 1, -1),
        new CubePosition(-1, 1, 0),
        new CubePosition(-1, 0, 1),
    ]);
});

test("should enumerate spiral", () => {
    const positions = Array.from(enumerateSpiral(new CubePosition(0, 0, 0), 2));
    expect(positions).toEqual([
        new CubePosition(0, 0, 0),
        new CubePosition(0, -1, 1),
        new CubePosition(1, -1, 0),
        new CubePosition(1, 0, -1),
        new CubePosition(0, 1, -1),
        new CubePosition(-1, 1, 0),
        new CubePosition(-1, 0, 1),
        new CubePosition(0, -2, 2),
        new CubePosition(1, -2, 1),
        new CubePosition(2, -2, 0),
        new CubePosition(2, -1, -1),
        new CubePosition(2, 0, -2),
        new CubePosition(1, 1, -2),
        new CubePosition(0, 2, -2),
        new CubePosition(-1, 2, -1),
        new CubePosition(-2, 2, 0),
        new CubePosition(-2, 1, 1),
        new CubePosition(-2, 0, 2),
        new CubePosition(-1, -1, 2),
    ]);
});