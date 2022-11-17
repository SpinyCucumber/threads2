import { CubePosition } from "../utility";
import PriorityQueue from "js-priority-queue";
import * as Immutable from "immutable";

export class CollapserError extends Error { }

type TileID = number;
type DirectionID = number;

export interface TileOptions {
    id: TileID;
    weight: number;
}

export class Tile {

    id: TileID;
    /**
     * The relative frequency of the tile. Determines how often the tile appears in the output
     */
    weight: number;
    weightLogWeight: number;

    constructor(options: TileOptions) {
        Object.assign(this, options);
        this.weightLogWeight = this.weight * Math.log2(this.weight);
    }

}

class AdjacencyRules {

    compatibleTiles: Map<TileID, Map<DirectionID, TileID[]>>

    constructor(rules: [TileID, TileID, DirectionID]) {
        // TODO
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
    /**
     * The collapsed value of the cell. If undefined, the cell is uncollapsed.
     */
    tile: Tile = undefined;

    constructor(options: CellOptions) {
        Object.assign(this, options);
    }

    get entropy(): number {
        return Math.log2(this.weightSum) - (this.weightLogWeightSum / this.weightSum) + this.entropyNoise;
    }

    get isCollapsed(): boolean {
        return this.tile !== undefined;
    }

    chooseTile(): Tile {
        let r = Math.random() * this.weightSum;
        for (const tile of this.allowedTiles) {
            if (r >= tile.weight) r -= tile.weight;
            else return tile;
        }
    }

    removeTile(tile: Tile) {
        this.allowedTiles.delete(tile);
        this.weightSum -= tile.weight;
        this.weightLogWeightSum -= tile.weightLogWeight;
    }

}

export interface CollapserOptions {
    positions: Iterable<CubePosition>;
    tiles: Tile[];
    noiseFunction: () => number;
}

export class Collapser {

    cells: Immutable.Map<CubePosition, Cell>;
    /**
     * A priority queue containing tuples of cell positions and entropy, sorted by minimum entropy.
     * Used to quickly find the cell with minimum entropy to speed up collapsing
     */
    entropyHeap = new PriorityQueue<[CubePosition, number]>({ comparator: ([, a], [, b]) => a - b});
    /**
     * A list containing tuples of cell position and tile. Used to track what tiles are removed while
     * collapsing a cell so that we can propogate changes.
     */
    removedTiles: [CubePosition, Tile][] = [];
    tiles: Map<TileID, Tile>;

    constructor({ positions, tiles, noiseFunction }: CollapserOptions) {
        this.tiles = new Map(tiles.map(tile => ([tile.id, tile])));
        // The sum of all tile weights, used for calculting cell entropy
        const weightSum = tiles.map(tile => tile.weight).reduce((a, b) => a + b, 0);
        // The sum of the quantity weight * log2(weight) of all tiles. Also used to calculate entropy
        const weightLogWeightSum = tiles.map(tile => tile.weightLogWeight).reduce((a, b) => a + b, 0)
        const createCell = () => new Cell({
            weightSum,
            weightLogWeightSum,
            allowedTiles: new Set(tiles),
            entropyNoise: noiseFunction(),
        });
        // Create new cell for each position
        this.cells = Immutable.Map(Immutable.Seq(positions).map(position => ([position, createCell()])));
        // Queue each cell
        this.cells.forEach((cell, position) => {
            this.entropyHeap.queue([position, cell.entropy]);
        });
    }

    /**
     * Runs the wave function collapse algorithm,
     * iteratively collapsing cells until all cells have been collapsed
     */
    run() {
        let position: CubePosition;
        while ((position = this.chooseCell()) !== undefined) {
            this.collapseCellAt(position);
            this.propogate();
        }
    }

    /**
     * Chooses the next cell to be collapsed, or undefined if all cells have been collapsed.
     * Returns the position of the cell to be collapsed.
     * The cell with the minimum entropy is chosen.
     */
    chooseCell(): CubePosition | undefined {
        while (this.entropyHeap.length > 0) {
            const [position] = this.entropyHeap.dequeue();
            if (!this.cells.get(position).isCollapsed) return position;
        }
        return undefined;
    }

    collapseCellAt(position: CubePosition) {
        const cell = this.cells.get(position);
        // Collapse cell
        cell.tile = cell.chooseTile();
        // Propogate tile removals
        const toRemove = new Set(cell.allowedTiles);
        toRemove.delete(cell.tile);
        for (const tile of toRemove) {
            this.removedTiles.push([position, tile]);
        }
    }

    propogate() {
        while (this.removedTiles.length > 0) {
            const [position, tile] = this.removedTiles.pop();
            // TODO
        }
    }

}