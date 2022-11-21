import { sum } from "../utility";

export class Tile {

    id: number;
    /**
     * The relative frequency of the tile. Determines how often the tile appears in the output
     */
    weight: number;
    weightLogWeight: number;

    constructor(id: number, weight: number) {
        this.id = id;
        this.weight = weight;
        this.weightLogWeight = this.weight * Math.log2(this.weight);
    }

    toString(): string {
        return `[Tile ${this.id}]`;
    }

}

export class TileSet {

    private map: Map<number, Tile>;
    /**
     * The sum of all tile weights, used for calculting cell entropy
     */
    readonly weightSum: number;
    /**
     * The sum of the quantity weight * log2(weight) of all tiles. Also used to calculate entropy
     */
    readonly weightLogWeightSum: number;

    constructor(tiles: Iterable<Tile>) {
        const tileArray = Array.from(tiles);
        this.map = new Map(tileArray.map(tile => ([tile.id, tile])));
        this.weightSum = sum(tileArray.map(tile => tile.weight));
        this.weightLogWeightSum = sum(tileArray.map(tile => tile.weightLogWeight));
    }

    get(id: number) {
        return this.map.get(id);
    }

    [Symbol.iterator]() {
        return this.map.values();
    }

}