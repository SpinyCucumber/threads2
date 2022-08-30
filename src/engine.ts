import { Directions, Direction, Grid, Vector, sum } from "./utility";

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

export const Tiles = [
   [0b00001000, 1],
   [0b10001000, 1],
   [0b10000100, 1],
   [0b10010000, 1],
   [0b00010001, 1],
   [0b01000100, 1],
   [0b10000000, 1]
].map(([connections, frequency], index) => new Tile(connections, frequency, index));

const tilesWithConnection = new Map<Direction, Set<Tile>>(Directions.map(direction => (
    [direction, new Set(Tiles.filter(tile => tile.hasConnection(direction)))]
)));

const totalWeight = sum(Tiles.map(tile => tile.weight));
const totalWeightLogWeight = sum(Tiles.map(tile => tile.weightLogWeight));

export class Cell {

    possibleTiles = Array(Tiles.length).fill(true);
    isCollapsed = false
    weightSum = totalWeight
    weightLogWeightSum = totalWeightLogWeight

    get entropy(): number {
        return Math.log2(this.weightSum) - (this.weightLogWeightSum / this.weightSum);
    }

    disallowTile(tile: Tile) {
        this.possibleTiles[tile.index] = false;
        this.weightSum -= tile.weight;
        this.weightLogWeightSum -= tile.weightLogWeight;
    }
    
    disallowConnection(direction: Direction) {
        // TODO
    }

    requireConnection(direction: Direction) {
        // TODO
    }

}

class Engine {

    cells: Grid<Cell>

    collapseCell(cell: Cell) {
        // TODO
    }

}