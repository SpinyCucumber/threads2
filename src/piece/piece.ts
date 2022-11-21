import { AdjacencyRules, AdjacencyRulesBuilder, Constraint, Tile, TileSet } from "../collapser";
import { CubePosition, CubeToOrthoTransform, direction, getOrInsert, numDirections, opposite, Position } from "../utility";
import { Part, PrimitiveType } from "../renderer";

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

    generateTile(): Tile {
        return new Tile(this.id, this.weight);
    }

    generatePart(transform: CubeToOrthoTransform): Part {
        const vertices: Position[] = [];
        const center = transform.transformPosition(new CubePosition({ q: 0, r: 0, s: 0 }));
        for (let d = 0; d < numDirections; d++) {
            if (this.hasConnection(d)) {
                vertices.push(center.add(transform.transformVector(direction(d)).scale(0.5)), center);
            }
        }
        return new Part(vertices, PrimitiveType.Lines);
    }

}

export class PieceSet {

    map: Map<number, Piece>;
    piecesWithConnection = new Map<number, Piece[]>();
    piecesWithoutConnection = new Map<number, Piece[]>();

    constructor(pieces: Iterable<Piece>) {
        this.map = new Map(Array.from(pieces).map(piece => ([piece.id, piece])));
        // For each direction, we track the pieces that do/do not have a connection along that direction.
        for (const piece of this) {
            for (let d = 0; d < numDirections; d++) {
                const map = (piece.hasConnection(d)) ? this.piecesWithConnection : this.piecesWithoutConnection;
                getOrInsert(map, d, () => <Piece[]>[]).push(piece);
            }
        }
    }

    generateTileSet(): TileSet {
        return new TileSet(Array.from(this).map(piece => piece.generateTile()));
    }

    generateAdjacencyRules(): AdjacencyRules {
        // Construct adjacency rules for each tile
        const builder = new AdjacencyRulesBuilder();
        for (const piece of this) {
            for (let d = 0; d < numDirections; d++) {
                const o = opposite(d);
                const map = (piece.hasConnection(d)) ? this.piecesWithConnection : this.piecesWithoutConnection;
                for (const compatible of map.get(o)) builder.withCompatibleTile(piece.id, compatible.id, d);
            }
        }
        return builder.build();
    }

    generateParts(transform: CubeToOrthoTransform): Map<number, Part> {
        return new Map(Array.from(this).map(piece => ([piece.id, piece.generatePart(transform)])));
    }

    createBorderConstraint(): Constraint {
        return (space) => space.map(position => {
            const toDisallow = <Piece[]>[];
            for (let d = 0; d < numDirections; d++) {
                const neighborPosition = position.add(direction(d));
                if (!space.has(neighborPosition)) {
                    toDisallow.push(...this.piecesWithConnection.get(d));
                }
            }
            return [position, toDisallow.map(piece => piece.id)];
        });
    }

    [Symbol.iterator]() {
        return this.map.values();
    }

}