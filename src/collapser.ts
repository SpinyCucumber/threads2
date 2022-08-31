import { directions, Direction, Grid, Vector, sum } from "./utility";
import PriorityQueue from "js-priority-queue"

export class Tile {

    connections: Set<Direction>;
    /**
     * The relative frequency of the tile. Determines how often the tile appears in the output
     */
    weight: number;
    weightLogWeight: number;
    index: number;

    /**
     * Constructs a new tile
     * @param connections An 8-bit number, where each bit determines whether the tile has a connection along the direction with that index.
     * @param weight 
     * @param index 
     */
    constructor(connections: number, weight: number, index: number) {
        this.connections = new Set(directions.filter(({ index }) => (connections >> index) & 1));
        this.weight = weight;
        this.weightLogWeight = weight * Math.log2(weight);
        this.index = index;
    }

}

interface CellInitializer {
    position: Vector
    possibleTiles: Set<Tile>
    enablers: number[]
    disablers: number[]
    weightSum: number
    weightLogWeightSum: number
    entropyNoise: number
}

class Cell {

    position: Vector
    possibleTiles: Set<Tile>
    enablers: number[]
    disablers: number[]
    // The collapsed value. If undefined, cell is uncollapsed
    value?: Tile
    weightSum: number
    weightLogWeightSum: number
    entropyNoise: number

    constructor(initializer: CellInitializer) {
        Object.assign(this, initializer);
    }

    get entropy(): number {
        return Math.log2(this.weightSum) - (this.weightLogWeightSum / this.weightSum) + this.entropyNoise;
    }

    chooseTile(): Tile {
        let remaining = Math.floor(Math.random() * this.weightSum);
        for (const tile of this.possibleTiles) {
            const { weight } = tile;
            if (remaining >= weight)
                remaining -= weight;
            else
                return tile;
        }
    }

    removeTile(tile: Tile) {
        this.possibleTiles.delete(tile);
        this.weightSum -= tile.weight;
        this.weightLogWeightSum -= tile.weightLogWeight;
    }

}

interface Removal {
    cell: Cell
    tile: Tile
}

export interface CollapserInitializer {
    width: number
    height: number
    tiles: Tile[]
    noiseFunction: () => number
} 

export class Collapser {

    grid: Grid<Cell>
    removals: Removal[] = []
    // The number of uncollapsed cells
    uncollapsedCells: number;
    // We use a priority queue to track the cells with the minimum entropy
    // to make collapsing cells quicker
    minEntropy = new PriorityQueue<Cell>({ comparator: (a, b) => (a.entropy - b.entropy) })
    tilesWithConnection: Set<Tile>[]
    tilesWithoutConnection: Set<Tile>[]

    constructor({ width, height, tiles, noiseFunction }: CollapserInitializer) {
        this.uncollapsedCells = width * height;
        // A mapping between directions and tiles which have a connection along that direction
        this.tilesWithConnection = directions.map(direction => (
            new Set(tiles.filter(tile => tile.connections.has(direction)))
        ));
        // A mapping between directions and tiles which DON'T have a connection along that direction
        this.tilesWithoutConnection = directions.map(direction => (
            new Set(tiles.filter(tile => !tile.connections.has(direction)))
        ));
        // The sum of all tile weights, used for calculting cell entropy
        const weightSum = sum(tiles.map(tile => tile.weight));
        // The sum of the quantity weight * log2(weight) of all tiles. Also used to calculate entropy
        const weightLogWeightSum = sum(tiles.map(tile => tile.weightLogWeight));
        // The number of total enablers for a connection along a given direction
        // An "enabler" is a possible tile that connects with the given side
        const enablers = this.tilesWithConnection.map(tiles => tiles.size);
        const disablers = this.tilesWithoutConnection.map(tiles => tiles.size);
        // Initialize grid and enqueue cells to entropy heap
        this.grid = new Grid<Cell>(width, height, position => {
            const cell = new Cell({
                position,
                possibleTiles: new Set(tiles),
                weightSum,
                weightLogWeightSum,
                enablers: [...enablers],
                disablers: [...disablers],
                entropyNoise: noiseFunction()
            });
            this.minEntropy.queue(cell);
            return cell;
        });
    }

    /**
     * Runs the wave function collapse algorithm,
     * iteratively collapsing cells until all cells have been collapsed
     */
    run(): Grid<Tile> {
        console.debug('Collapsing grid!');
        while (this.uncollapsedCells > 0) {
            const cell = this.chooseCell();
            this.collapseCell(cell);
            this.propagate();
            this.uncollapsedCells -= 1;
        }
        return this.grid.map(cell => cell.value);
    }

    /**
     * Chooses the next cell to be collapsed
     * The cell with the minimum entropy is chosen.
     * Entropy is calculated using the cell's remaining possible tiles.
     */
    chooseCell(): Cell {
        let cell: Cell;
        while (cell = this.minEntropy.dequeue()) {
            if (cell.value === undefined) return cell;
        }
    }

    /**
     * Collapses a given
     * This involves picking a tile from the cell's possible tiles,
     * removing the other possible tiles, and propagating the changes.
     */
    collapseCell(cell: Cell) {
        console.debug(`Collapsing cell ${cell.position}`);
        // Set cell value
        cell.value = cell.chooseTile();
        console.debug(`Cell ${cell.position} collapsed to tile ${cell.value.index}`);
        // Remove tiles that were not chosen
        for (const tile of cell.possibleTiles) {
            if (tile === cell.value) continue;
            // Push removal so we can propogate removals
            this.removals.push({ cell, tile });
        }
    }

    propagate() {
        let removal: Removal;
        while (removal = this.removals.pop()) {
            // For each of the removed tile's connections, decrement the "enabler" count of the neighbor
            // along the specified connection
            const { tile: removedTile, cell } = removal;
            console.debug(`Propagating removal of tile ${removedTile.index} from cell ${cell.position}`);
            for (const direction of directions) {
                // Get neighbor
                const neighborPosition = cell.position.sum(direction.vector);
                if (!this.grid.isValidPosition(neighborPosition)) continue;
                const neighbor = this.grid.get(neighborPosition);
                // Skip collapsed neighbors
                if (neighbor.value !== undefined) continue;
                const index = direction.opposite.index;
                // TODO Find a better pattern here!
                if (removedTile.connections.has(direction)) {
                    // Decrement enabler count of opposite direction
                    console.debug(`Decrementing enablers of cell ${neighbor.position} for connection ${direction.opposite.vector}`);
                    neighbor.enablers[index] -= 1;
                    // If enabler count is 0 (all enablers have been removed), we remove tiles from the neighbor
                    // that have a connection along the specified direction
                    if (neighbor.enablers[index] === 0) {
                        for (const tile of this.tilesWithConnection[index]) {
                            // If tile has already been removed, skip
                            if (!neighbor.possibleTiles.has(tile)) continue;
                            // Remove tile
                            console.debug(`Removing tile ${tile.index} from cell ${neighbor.position}`);
                            neighbor.removeTile(tile);
                            // Entropy changed, so re-queue cell
                            this.minEntropy.queue(neighbor);
                            // Push removal
                            this.removals.push({ cell: neighbor, tile });
                        }
                    }
                } else {
                    // Decrement disabler count of opposite direction
                    console.debug(`Decrementing disablers of cell ${neighbor.position} for connection ${direction.opposite.vector}`);
                    neighbor.disablers[index] -= 1;
                    // If disabler count is 0 (all disablers have been removed), we remove tiles from the neighbor
                    // that have a connection along the specified direction
                    if (neighbor.disablers[index] === 0) {
                        for (const tile of this.tilesWithoutConnection[index]) {
                            // If tile has already been removed, skip
                            if (!neighbor.possibleTiles.has(tile)) continue;
                            // Remove tile
                            console.debug(`Removing tile ${tile.index} from cell ${neighbor.position}`);
                            neighbor.removeTile(tile);
                            // Entropy changed, so re-queue cell
                            this.minEntropy.queue(neighbor);
                            // Push removal
                            this.removals.push({ cell: neighbor, tile });
                        }
                    }
                }
            }
        }
    }

}