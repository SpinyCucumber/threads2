import { CubePosition } from "../utility";
import { Map, Set, Seq } from "immutable";

export class ConnectionClass {
    // TODO
}

export interface TileOptions {
    weight: number;
    connections: Map<number, ConnectionClass>;
}

export class Tile {

    /**
     * The relative frequency of the tile. Determines how often the tile appears in the output
     */
    weight: number;
    weightLogWeight: number;
    /**
     * Map between direction index and connection type.
     * Describes what type of connection the tile has along each side.
     */
    connections: Map<number, ConnectionClass>;

    constructor(options: TileOptions) {
        Object.assign(this, options);
        this.weightLogWeight = this.weight * Math.log2(this.weight);
    }

}

interface CellOptions {
    weightSum: number;
    weightLogWeightSum: number;
    entropyNoise: number;
    allowedTiles: Set<Tile>;
}

class Cell {

    /**
     * Sum of weights of allowed tiles
     * */
    weightSum: number
    /**
     * Sum of weight * log2(weight) of allowed tiles
     */
    weightLogWeightSum: number
    /**
     * Small, random value added to entropy to resolve ties
     */
    entropyNoise: number

    allowedTiles: Set<Tile>;

    constructor(options: CellOptions) {
        Object.assign(this, options);
    }

    get entropy(): number {
        return Math.log2(this.weightSum) - (this.weightLogWeightSum / this.weightSum) + this.entropyNoise;
    }

    chooseTile(): Tile {
        let r = Math.random() * this.weightSum;
        for (const tile of this.allowedTiles) {
            if (r >= tile.weight) r -= tile.weight;
            else return tile;
        }
    }

    removeTile(tile: Tile) {
        this.allowedTiles = this.allowedTiles.delete(tile);
        this.weightSum -= tile.weight;
        this.weightLogWeightSum -= tile.weightLogWeight;
    }

}

export interface CollapserOptions {
    positions: Iterable<CubePosition>;
    tiles: Set<Tile>;
    classes: Set<ConnectionClass>;
    noiseFunction: () => number;
}

export class Collapser {

    cells: Map<CubePosition, Cell>;

    constructor({ positions, tiles, classes, noiseFunction }: CollapserOptions) {
        // The sum of all tile weights, used for calculting cell entropy
        const weightSum = Seq(tiles).map(tile => tile.weight).reduce((a, b) => a + b, 0);
        // The sum of the quantity weight * log2(weight) of all tiles. Also used to calculate entropy
        const weightLogWeightSum = Seq(tiles).map(tile => tile.weightLogWeight).reduce((a, b) => a + b, 0)
        const createCell = () => new Cell({
            weightSum,
            weightLogWeightSum,
            allowedTiles: tiles,
            entropyNoise: noiseFunction(),
        });
        // Create new cell for each position
        this.cells = Map(Seq(positions).map(position => ([position, createCell()])));
    }

    /**
     * Chooses the next cell to be collapsed
     */
    choosePosition(): CubePosition {
        return null;
    }

    collapseCellAt(position: CubePosition) {
        // TODO
    }

    propogate() {
        // TODO
    }

}