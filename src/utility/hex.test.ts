import { test } from "@jest/globals"
import { directions, CubeVector } from "./hex";

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