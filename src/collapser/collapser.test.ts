import { test, expect } from "@jest/globals";
import { AdjacencyRulesBuilder } from "./adjacency";
import { Tile, TileSet } from "./tile";

test("should calculate weightLogWeight", () => {
    const tile = new Tile(0, 10);
    expect(tile.weightLogWeight).toBeCloseTo(33.22);
});

test("should sum weights", () => {
    const tileSet = new TileSet([
        new Tile(0, 10),
        new Tile(1, 5),
        new Tile(2, 20),
    ]);
    expect(tileSet.weightSum).toBeCloseTo(35);
    expect(tileSet.weightLogWeightSum).toBeCloseTo(131.27)
});

test("should retrieve tile by id", () => {
    const tile = new Tile(0, 1);
    const tileSet = new TileSet([tile]);
    expect(tileSet.get(0)).toBe(tile);
});

test("should compute compatible tiles", () => {
    const rules = new AdjacencyRulesBuilder()
        .withRule(0, 1, 0)
        .withRule(0, 2, 3)
        .withRule(1, 2, 3)
        .withRule(1, 2, 0)
        .build();
    expect(Array.from(rules.getCompatibleTiles(0))).toEqual([
        [0, [1]],
        [3, [2]],
    ]);
    expect(Array.from(rules.getCompatibleTiles(1))).toEqual([
        [3, [0, 2]],
        [0, [2]],
    ]);
    expect(Array.from(rules.getCompatibleTiles(2))).toEqual([
        [0, [0, 1]],
        [3, [1]],
    ]);
});

test("should compute enabler counts", () => {
    const rules = new AdjacencyRulesBuilder()
        .withRule(0, 1, 0)
        .withRule(0, 2, 3)
        .withRule(1, 2, 3)
        .withRule(1, 2, 0)
        .build();
    expect(rules.enablerCounts.get(0)).toEqual(new Map([[0, 1], [3, 1]]));
    expect(rules.enablerCounts.get(1)).toEqual(new Map([[3, 2], [0, 1]]));
    expect(rules.enablerCounts.get(2)).toEqual(new Map([[0, 2], [3, 1]]));
});