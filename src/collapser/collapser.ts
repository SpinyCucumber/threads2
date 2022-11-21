import { CubePosition, direction, getOrInsert, opposite } from "../utility";
import { Tile, TileSet } from "./tile";
import PriorityQueue from "js-priority-queue";
import * as Immutable from "immutable";

export class CollapserError extends Error { }

export class AdjacencyRulesBuilder {

    private compatibleTiles = new Map<number, Map<number, number[]>>();

    withCompatibleTile(from: number, to: number, direction: number): AdjacencyRulesBuilder {
        const tilesByDirection = getOrInsert(this.compatibleTiles, from, () => new Map<number, number[]>);
        const tiles = getOrInsert(tilesByDirection, direction, () => <number[]>[]);
        tiles.push(to);
        return this;
    }

    withRule(from: number, to: number, direction: number): AdjacencyRulesBuilder {
        this.withCompatibleTile(from, to, direction);
        this.withCompatibleTile(to, from, opposite(direction));
        return this;
    }

    build(): AdjacencyRules {
        return new AdjacencyRules(this.compatibleTiles);
    }

}

export class AdjacencyRules {

    private compatibleTiles: Map<number, Map<number, number[]>>;
    readonly enablers: Map<number, Map<number, number>>;

    constructor(compatibleTiles: Iterable<[number, Iterable<[number, number[]]>]>) {
        this.compatibleTiles = new Map(Array.from(compatibleTiles).map(
            ([tile, tilesByDirection]) => ([tile, new Map(tilesByDirection)])
        ));
        // Compute enablers from compatible tiles
        this.enablers = new Map<number, Map<number, number>>();
        for (const [tile, compatibleTilesByDirection] of this.compatibleTiles) {
            for (const [direction, compatibleTiles] of compatibleTilesByDirection) {
                const enablersByDirection = getOrInsert(this.enablers, tile, () => new Map<number, number>());
                enablersByDirection.set(direction, compatibleTiles.length);
            }
        }
    }

    getCompatibleTiles(id: number): IterableIterator<[number, number[]]> {
        return this.compatibleTiles.get(id).entries();
    }

}

export class EnablerCounter {

    counts: Map<number, number>;
    private disabled = false;

    constructor(counts: Iterable<[number, number]> = []) {
        this.counts = new Map(counts);
    }

    decrement(d: number): boolean {
        const value = this.counts.get(d) - 1;
        this.counts.set(d, value);
        if (value === 0 && !this.disabled) {
            this.disabled = true;
            return true;
        }
        return false;
    }

}

interface CellOptions {
    entropyNoise: number;
    initialWeightSum: number;
    initialWeightLogWeightSum: number;
    initialAllowedTiles: Iterable<Tile>;
    initialEnablers: Iterable<[number, Iterable<[number, number]>]>;
}

class Cell {

    /**
     * Sum of weights of allowed tiles
     * */
    private weightSum: number
    /**
     * Sum of weight * log2(weight) of allowed tiles
     */
    private weightLogWeightSum: number
    /**
     * Small, random value added to entropy to resolve ties
     */
    private entropyNoise: number
    private allowedTiles: Set<Tile>;
    /**
     * The collapsed value of the cell. If undefined, the cell is uncollapsed.
     */
    private tile: Tile = undefined;
    private enablers: Map<number, EnablerCounter>;

    constructor({ entropyNoise, initialWeightSum, initialWeightLogWeightSum, initialAllowedTiles, initialEnablers }: CellOptions) {
        this.entropyNoise = entropyNoise;
        this.weightSum = initialWeightSum;
        this.weightLogWeightSum = initialWeightLogWeightSum;
        this.allowedTiles = new Set(initialAllowedTiles);
        this.enablers = new Map(Array.from(initialEnablers).map(([tileID, counts]) => ([tileID, new EnablerCounter(counts)])));
    }

    get entropy(): number {
        return Math.log2(this.weightSum) - (this.weightLogWeightSum / this.weightSum) + this.entropyNoise;
    }

    get isCollapsed(): boolean {
        return this.tile !== undefined;
    }

    getTile(): Tile {
        if (this.tile === undefined) throw new CollapserError("Cell has not been collapsed.");
        return this.tile;
    }

    getWeightSum(): number {
        return this.weightSum;
    }

    getAllowedTiles(): Set<Tile> {
        return this.allowedTiles;
    }

    getEnablerCounter(tileID: number): EnablerCounter {
        return this.enablers.get(tileID);
    }

    removeTile(tile: Tile) {
        this.allowedTiles.delete(tile);
        this.weightSum -= tile.weight;
        this.weightLogWeightSum -= tile.weightLogWeight;
    }

    /**
     * Collapses the cell to a specific tile, yielding the removed tiles.
     * Cells can only be collapsed once. Once collapsed, the collapsed value can be accessed using cell.getTile()
     */
    *collapse(tile: Tile): Generator<Tile> {
        if (this.tile !== undefined) throw new CollapserError("Cell already collapsed.");
        this.tile = tile;
        for (const allowedTile of this.allowedTiles) {
            if (allowedTile !== tile) yield allowedTile;
        }
    }

}

export interface CollapserOptions {
    space: Iterable<CubePosition>;
    tiles: TileSet,
    rules: AdjacencyRules;
    noiseFunction: () => number;
    tileSelector?: (allowedTiles: Set<Tile>, weightSum: number) => Tile;
}

export class Collapser {

    cells: Immutable.Map<CubePosition, Cell>;
    /**
     * A priority queue containing tuples of cell positions and entropy, sorted by minimum entropy.
     * Used to quickly find the cell with minimum entropy to speed up collapsing
     */
    entropyHeap = new PriorityQueue<[CubePosition, number]>({ comparator: ([, a], [, b]) => a - b });
    /**
     * A list containing tuples of cell position and tile. Used to track what tiles are removed while
     * collapsing a cell so that we can propogate changes.
     */
    removals: [CubePosition, Tile][] = [];
    tiles: TileSet;
    rules: AdjacencyRules;
    tileSelector: (allowedTiles: Set<Tile>, weightSum: number) => Tile;

    constructor({ space, tiles, rules, noiseFunction, tileSelector = defaultTileSelector }: CollapserOptions) {

        this.tiles = tiles;
        this.rules = rules;
        this.tileSelector = tileSelector;

        const factory = () => new Cell({
            entropyNoise: noiseFunction(),
            initialWeightSum: tiles.weightSum,
            initialWeightLogWeightSum: tiles.weightLogWeightSum,
            initialAllowedTiles: tiles,
            initialEnablers: rules.enablers,
        });

        // Create new cell for each position
        this.cells = Immutable.Map(Immutable.Seq(space).map(position => ([position, factory()])));
        // Queue each cell
        this.cells.forEach((cell, position) => {
            this.entropyHeap.queue([position, cell.entropy]);
        });

    }

    /**
     * Runs the wave function collapse algorithm,
     * iteratively collapsing cells until all cells have been collapsed
     */
    run(): Immutable.Map<CubePosition, Tile> {
        let position: CubePosition;
        while ((position = this.selectCell()) !== undefined) {
            this.collapseCellAt(position);
            this.propogate();
        }
        return this.cells.map(cell => cell.getTile());
    }

    /**
     * Chooses the next cell to be collapsed, or undefined if all cells have been collapsed.
     * Returns the position of the cell to be collapsed.
     * The cell with the minimum entropy is chosen.
     */
    selectCell(): CubePosition | undefined {
        while (this.entropyHeap.length > 0) {
            const [position] = this.entropyHeap.dequeue();
            if (!this.cells.get(position).isCollapsed) return position;
        }
        return undefined;
    }

    collapseCellAt(position: CubePosition) {
        const cell = this.cells.get(position);
        // Collapse cell and push tile removals
        const tile = this.tileSelector(cell.getAllowedTiles(), cell.getWeightSum());
        for (const removed of cell.collapse(tile)) {
            this.removals.push([position, removed]);
        }
    }

    propogate() {
        while (this.removals.length > 0) {
            const [position, tile] = this.removals.pop();
            // For each direction (with compatible tiles), iterate over tiles that may appear next to removed tile along direction
            for (const [d, compatible] of this.rules.getCompatibleTiles(tile.id)) {
                // Find neighbor position
                // Skip if neighbor does not exist at position or neighbor is collapsed
                const neighborPosition = position.add(direction(d));
                const neighbor = this.cells.get(neighborPosition);
                if (neighbor === undefined || neighbor.isCollapsed) continue;
                // For each compatible tile, decrement enabler
                const o = opposite(d);
                for (const c of compatible) {
                    const enablerCounter = neighbor.getEnablerCounter(c);
                    // If the tile becomes disabled, remove tile
                    if (enablerCounter.decrement(o)) {
                        const tile = this.tiles.get(c);
                        neighbor.removeTile(tile);
                        // Re-queue cell and add removal to stack
                        this.entropyHeap.queue([neighborPosition, neighbor.entropy]);
                        this.removals.push([neighborPosition, tile]);
                    }
                }
            }
        }
    }

}

const defaultTileSelector = (allowedTiles: Set<Tile>, weightSum: number) => {
    let r = Math.random() * weightSum;
    for (const tile of allowedTiles) {
        if (r < tile.weight) return tile;
        r -= tile.weight;
    }
}