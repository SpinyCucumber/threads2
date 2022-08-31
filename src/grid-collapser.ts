import { directions, Direction, Grid, Vector, sum } from "./utility";
import PriorityQueue from "ts-priority-queue"

export class Tile {

    /**
     * An 8-bit number, where each bit determines whether the tile has a connection along the direction with that index.
     */
    connections: number;
    /**
     * The relative frequency of the tile. Determines how often the tile appears in the output
     */
    weight: number;
    weightLogWeight: number;
    index: number;

    constructor(connections: number, weight: number, index: number) {
        this.connections = connections;
        this.weight = weight;
        this.weightLogWeight = weight * Math.log2(weight);
        this.index = index;
    }

    hasConnection(direction: Direction): boolean {
        return Boolean((this.connections >> direction.index) & 1);
    }

    *getConnections() {
        for (const direction of directions) {
            if (this.hasConnection(direction)) yield direction;
        }
    }

}

export const tiles = [
   [0b00001000, 1],
   [0b10001000, 1],
   [0b00001001, 1],
   [0b01001000, 1],
   [0b10000100, 1],
   [0b10010000, 1],
   [0b00010001, 1],
   [0b01000100, 1],
   [0b10000000, 1],
].map(([connections, frequency], index) => new Tile(connections, frequency, index));

// A mapping between directions and tiles which have a connection along that direction
const tilesWithConnection = directions.map(direction => (
    new Set(tiles.filter(tile => tile.hasConnection(direction)))
));

// The sum of all tile weights, used for calculting cell entropy
const totalWeight = sum(tiles.map(tile => tile.weight));
// The sum of the quantity weight * log2(weight) of all tiles. Also used to calculate entropy
const totalWeightLogWeight = sum(tiles.map(tile => tile.weightLogWeight));
// The number of total enablers for a connection along a given direction
// An "enabler" is a possible tile that connects with the given side
const totalEnablers = tilesWithConnection.map(tiles => tiles.size);

function createEntropyNoise(): number {
    return Math.random() * 0.1;
}

console.debug("tilesWithConnection:", tilesWithConnection);
console.debug("totalEnablers:", totalEnablers);

export class Cell {

    position: Vector
    possibleTiles = new Set(tiles)
    enablers = [...totalEnablers]
    isCollapsed = false
    weightSum = totalWeight
    weightLogWeightSum = totalWeightLogWeight
    entropyNoise = createEntropyNoise()

    constructor(position: Vector) {
        this.position = position;
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

class GridCollapser {

    grid: Grid<Cell>
    removals: Removal[] = []
    // The number of uncollapsed cells
    uncollapsedCells: number;
    // We use a priority queue to track the cells with the minimum entropy
    // to make collapsing cells quicker
    minEntropy = new PriorityQueue<Cell>({ comparator: (a, b) => (a.entropy - b.entropy) })

    constructor(width, height) {
        this.uncollapsedCells = width * height;
        // Initialize grid and enqueue cells to entropy heap
        this.grid = new Grid<Cell>(width, height, position => {
            const cell = new Cell(position);
            this.minEntropy.queue(cell);
            return cell;
        });
    }

    /**
     * Runs the wave function collapse algorithm,
     * iteratively collapsing cells until all cells have been collapsed
     */
    run() {
        while (this.uncollapsedCells > 0) {
            const cell = this.chooseCell();
            this.collapseCell(cell);
            this.propogate();
            this.uncollapsedCells -= 1;
        }
    }

    /**
     * Chooses the next cell to be collapsed
     * The cell with the minimum entropy is chosen.
     * Entropy is calculated using the cell's remaining possible tiles.
     */
    chooseCell(): Cell {
        let cell: Cell;
        while (cell = this.minEntropy.dequeue()) {
            if (!cell.isCollapsed) return cell;
        }
    }

    /**
     * Collapses a given
     * This involves picking a tile from the cell's possible tiles,
     * removing the other possible tiles, and propagating the changes.
     */
    collapseCell(cell: Cell) {
        const chosenTile = cell.chooseTile();
        // Mark cell as collapsed
        cell.isCollapsed = true;
        // Remove tiles that were not chosen
        for (const tile of cell.possibleTiles) {
            if (tile === chosenTile) continue;
            cell.possibleTiles.delete(tile);
            // Push removal so we can propogate removals
            this.removals.push({ cell, tile });
        }
    }

    propogate() {
        let removal: Removal;
        while (removal = this.removals.pop()) {
            // For each of the removed tile's connections, decrement the "enabler" count of the neighbor
            // along the specified connection
            const { tile: removedTile, cell } = removal;
            for (const direction of removedTile.getConnections()) {
                // Get neighbor
                const neighborPosition = cell.position.sum(direction.vector);
                if (!this.grid.isValidPosition(neighborPosition)) continue;
                const neighbor = this.grid.get(neighborPosition);
                // Skip collapsed neighbors
                if (neighbor.isCollapsed) continue;
                // Decrement enabler count of opposite direction
                const index = direction.opposite.index;
                neighbor.enablers[index] -= 1;
                // If enabler count is 0 (all enablers have been removed), we remove tiles from the neighbor
                // that have a connection along the specified direction
                if (neighbor.enablers[index] === 0) {
                    for (const tile of tilesWithConnection[index]) {
                        // If tile has already been removed, skip
                        if (!neighbor.possibleTiles.has(tile)) continue;
                        // Remove tile
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