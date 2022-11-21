import { CubePosition, direction, opposite } from "../utility";
import { Tile, TileSet } from "./tile";
import { AdjacencyRules } from "./adjacency";
import PriorityQueue from "js-priority-queue";
import * as Immutable from "immutable";

export class CollapserError extends Error { }

export type Constraint = (space: Immutable.Set<CubePosition>) => Iterable<[CubePosition, number[]]>;

export class EnablerCounter {

    counts: Map<number, number>;
    private disabled = false;

    constructor(counts: Iterable<[number, number]> = []) {
        this.counts = new Map(counts);
    }

    isDisabled(): boolean {
        return this.disabled;
    }

    /**
     * Decreases the number of enablers along direction d.
     * If tile has already been disabled, this method produces an error.
     * Returns whether the tile is disabled, after the decrease operation
     */
    decrease(d: number): boolean {
        if (this.disabled) throw new CollapserError("Attempt to decrease enablers of disabled tile.");
        const decreased = this.counts.get(d) - 1;
        this.counts.set(d, decreased);
        if (decreased === 0) this.disabled = true;
        return this.disabled;
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

    isTileAllowed(tile: Tile) {
        return this.allowedTiles.has(tile);
    }

    disallowTile(tile: Tile) {
        this.allowedTiles.delete(tile);
        this.weightSum -= tile.weight;
        this.weightLogWeightSum -= tile.weightLogWeight;
    }

    /**
     * Collapses the cell to a specific tile, yielding the disallowed tiles.
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
    heat?: number;
    constraints?: Iterable<Constraint>;
    noiseFunction: () => number;
}

export class Collapser {

    cells: Immutable.Map<CubePosition, Cell>;
    constraints = <Constraint[]>[];
    /**
     * A priority queue containing tuples of cell positions and entropy, sorted by minimum entropy.
     * Used to quickly find the cell with minimum entropy to speed up collapsing
     */
    entropyHeap = new PriorityQueue<[CubePosition, number]>({ comparator: ([, a], [, b]) => a - b });
    /**
     * A list containing tuples of cell position and tile. Used to track what tiles are disallowed while
     * collapsing a cell so that we can propogate changes.
     */
    disallowStack: [CubePosition, Tile][] = [];
    tiles: TileSet;
    rules: AdjacencyRules;
    heat = 1.0; // TODO Implement

    constructor(options: CollapserOptions) {

        this.tiles = options.tiles;
        this.rules = options.rules;
        if (options.constraints) this.constraints = Array.from(options.constraints);
        if (options.heat) this.heat = options.heat;

        const factory = () => new Cell({
            entropyNoise: options.noiseFunction(),
            initialWeightSum: this.tiles.weightSum,
            initialWeightLogWeightSum: this.tiles.weightLogWeightSum,
            initialAllowedTiles: this.tiles,
            initialEnablers: this.rules.enablerCounts,
        });

        // Create new cell for each position
        this.cells = Immutable.Map(Immutable.Seq(options.space).map(position => ([position, factory()])));
        // Queue each cell
        this.cells.forEach((cell, position) => {
            this.entropyHeap.queue([position, cell.entropy]);
        });

    }

    private applyConstraints() {
        const space = Immutable.Set(this.cells.keys());
        for (const constraint of this.constraints) {
            for (const [position, toDisallow] of constraint(space)) {
                if (!this.cells.has(position)) throw new CollapserError(`Cell at ${position} does not exist.`);
                const cell = this.cells.get(position);
                let entropyChanged = false;
                for (const tileID of toDisallow) {
                    const tile = this.tiles.get(tileID);
                    // Don't disallow tile if already disallowed
                    if (!cell.isTileAllowed(tile)) continue;
                    cell.disallowTile(tile);
                    this.disallowStack.push([position, tile]);
                    entropyChanged = true;
                }
                // If entropy has changed, requeue cell
                if (entropyChanged) this.entropyHeap.queue([position, cell.entropy]);
                this.propogate();
            }
        }
    }

    /**
     * Runs the wave function collapse algorithm,
     * iteratively collapsing cells until all cells have been collapsed
     */
    run(): Immutable.Map<CubePosition, Tile> {
        // First, apply constraints
        this.applyConstraints();
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
        const tile = this.selectTile(cell.getAllowedTiles(), cell.getWeightSum());
        for (const removed of cell.collapse(tile)) {
            this.disallowStack.push([position, removed]);
        }
    }

    propogate() {
        while (this.disallowStack.length > 0) {
            const [position, tile] = this.disallowStack.pop();
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
                    // Skip compatible tile if already disabled
                    const enablerCounter = neighbor.getEnablerCounter(c);
                    if (enablerCounter.isDisabled()) continue;
                    // If the tile becomes disabled, disallow tile
                    if (enablerCounter.decrease(o)) {
                        const tile = this.tiles.get(c);
                        neighbor.disallowTile(tile);
                        // Re-queue cell and add disallowed tile to stack
                        this.entropyHeap.queue([neighborPosition, neighbor.entropy]);
                        this.disallowStack.push([neighborPosition, tile]);
                    }
                }
            }
        }
    }

    private selectTile(allowedTiles: Set<Tile>, weightSum: number): Tile {
        let r = Math.random() * weightSum;
        for (const tile of allowedTiles) {
            if (r < tile.weight) return tile;
            r -= tile.weight;
        }
    }

}