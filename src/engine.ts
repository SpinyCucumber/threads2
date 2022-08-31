import { directions, Direction, Grid, Vector, sum } from "./utility";

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

console.debug("tilesWithConnection:", tilesWithConnection);
console.debug("totalEnablers:", totalEnablers);

export class Cell {

    possibleTiles = new Set(tiles)
    enablers = [...totalEnablers]
    isCollapsed = false
    weightSum = totalWeight
    weightLogWeightSum = totalWeightLogWeight

    get entropy(): number {
        return Math.log2(this.weightSum) - (this.weightLogWeightSum / this.weightSum);
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

class Engine {

    cells: Grid<Cell>

    collapseCell(cell: Cell) {
        // TODO
    }

}