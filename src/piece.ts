import { AdjacencyRules, AdjacencyRulesBuilder, Tile, TileSet } from "./collapser";

export class Piece {

    id: number;
    connections: number;
    weight: number;

    constructor(id: number, connections: number, weight: number) {
        this.id = id;
        this.connections = connections;
        this.weight = weight;
    }

}

export class PieceSet {

    map: Map<number, Piece>;

    constructor(pieces: Iterable<Piece>) {
        this.map = new Map(Array.from(pieces).map(piece => ([piece.id, piece])));
    }

    generateTileSet(): TileSet {
        return new TileSet(Array.from(this).map(({ id, weight }) => new Tile(id, weight)));
    }

    generateAdjacencyRules(): AdjacencyRules {
        // TODO
        return;
    }

    [Symbol.iterator]() {
        return this.map.values();
    }

}