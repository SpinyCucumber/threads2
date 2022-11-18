import { AdjacencyRules, AdjacencyRulesBuilder, Tile, TileSet } from "../collapser";
import { numDirections, opposite } from "../utility";

export class Piece {

    id: number;
    connections: number;
    weight: number;

    constructor(id: number, connections: number, weight: number) {
        this.id = id;
        this.connections = connections;
        this.weight = weight;
    }

    hasConnection(direction: number): boolean {
        return ((this.connections >> (numDirections - direction - 1)) & 1) === 1;
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
        const mapFactory = () => new Map(Array.from(Array(numDirections).keys()).map(
            i => ([i, <Piece[]>[]])
        ));
        // For each direction, we track the pieces that do/do not have a connection along that direction.
        const piecesWithConnection = mapFactory();
        const piecesWithoutConnection = mapFactory();
        for (const piece of this) {
            for (let d = 0; d < numDirections; d++) {
                if (piece.hasConnection(d)) piecesWithConnection.get(d).push(piece);
                else piecesWithoutConnection.get(d).push(piece);
            }
        }
        // Construct adjacency rules for each tile
        const builder = new AdjacencyRulesBuilder();
        for (const piece of this) {
            for (let d = 0; d < numDirections; d++) {
                const o = opposite(d);
                const compatiblePieces = piece.hasConnection(d) ? piecesWithConnection.get(o) : piecesWithoutConnection.get(o);
                for (const compatible of compatiblePieces) builder.withCompatibleTile(piece.id, compatible.id, d);
            }
        }
        return builder.build();
    }

    [Symbol.iterator]() {
        return this.map.values();
    }

}