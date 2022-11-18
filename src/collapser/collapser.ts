import { Counter, CubePosition, DefaultedMap, direction, opposite, sum } from "../utility";
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

class TileSet {

    private map: Map<TileID, Tile>;
    /**
     * The sum of all tile weights, used for calculting cell entropy
     */
    readonly weightSum: number;
    /**
     * The sum of the quantity weight * log2(weight) of all tiles. Also used to calculate entropy
     */
    readonly weightLogWeightSum: number;

    constructor(tiles: Tile[]) {
        this.map = new Map(tiles.map(tile => ([tile.id, tile])));
        this.weightSum = sum(tiles.map(tile => tile.weight));
        this.weightLogWeightSum = sum(tiles.map(tile => tile.weightLogWeight));
    }

    get(id: TileID) {
        return this.map.get(id);
    }

    [Symbol.iterator]() {
        return this.map.values();
    }

}

class AdjacencyRules {

    private compatibleTiles: Map<TileID, Map<DirectionID, TileID[]>>;
    readonly enablers: Map<TileID, Map<DirectionID, number>>;

    constructor(rules: [TileID, TileID, DirectionID][]) {
        // Compute compatible tiles
        this.compatibleTiles = new DefaultedMap(() => new DefaultedMap(() => []));
        for (const [from, to, direction] of rules) {
            this.compatibleTiles.get(from).get(direction).push(to);
            this.compatibleTiles.get(to).get(opposite(direction)).push(from);
        }
        // Compute enablers from compatible tiles
        this.enablers = new DefaultedMap(() => new Map());
        for (const [tile, compatibleTilesByDirection] of this.compatibleTiles) {
            for (const [direction, compatibleTiles] of compatibleTilesByDirection) {
                this.enablers.get(tile).set(direction, compatibleTiles.length);
            }
        }
    }

    getCompatibleTiles(id: TileID): IterableIterator<[DirectionID, TileID[]]> {
        return this.compatibleTiles.get(id).entries();
    }

}

interface CellOptions {
    weightSum: number;
    weightLogWeightSum: number;
    entropyNoise: number;
    allowedTiles: Set<Tile>;
    enablers: Map<Tile, Counter<DirectionID>>;
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
    enablers: Map<Tile, Counter<DirectionID>>;

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
    tiles: TileSet,
    rules: AdjacencyRules;
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
    tiles: TileSet;
    rules: AdjacencyRules;

    constructor({ positions, tiles, rules, noiseFunction }: CollapserOptions) {
        this.tiles = tiles;
        this.rules = rules;
        const { weightSum, weightLogWeightSum } = tiles;
        function createCell() {
            const enablers = new Map(Array.from(rules.enablers.entries()).map(
                ([tileID, enablersByDirection]) => ([tiles.get(tileID), new Counter(enablersByDirection)])
            ));
            return new Cell({
                weightSum,
                weightLogWeightSum,
                allowedTiles: new Set(tiles),
                entropyNoise: noiseFunction(),
                enablers,
            });
        }
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
            // For each direction (with compatible tiles), iterate over tiles that may appear next to removed tile along direction
            for (const [d, compatible] of this.rules.getCompatibleTiles(tile.id)) {
                // Find neighbor position
                // Skip if neighbor does not exist at position or neighbor is collapsed
                const neighbor = this.cells.get(position.add(direction(d)));
                if (neighbor === undefined || neighbor.isCollapsed) continue;
                // For each compatible tile, decrement enabler
                for (const c of compatible) {
                    // TODO
                }
            }
        }
    }

}