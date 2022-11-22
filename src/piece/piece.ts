import { AdjacencyRules, AdjacencyRulesBuilder, Constraint, Tile, TileSet } from "../collapser";
import { CubePosition, CubeToOrthoTransform, directions, getOrInsert, opposite, Position } from "../utility";
import { Curve } from "../utility/curve";
import { Part, PrimitiveType } from "../webgl-renderer";

export class Piece {

    id: number;
    connections: number;
    weight: number;

    constructor(id: number, connections: number, weight: number) {
        this.id = id;
        this.connections = connections;
        this.weight = weight;
    }

    hasConnection(d: number): boolean {
        return ((this.connections >> (directions.size - d - 1)) & 1) === 1;
    }

    generateTile(): Tile {
        return new Tile(this.id, this.weight);
    }

    generatePart(transform: CubeToOrthoTransform): Part {
        const vertices: Position[] = [];
        const center = transform.transformPosition(new CubePosition({ q: 0, r: 0, s: 0 }));
        for (let d = 0; d < directions.size; d++) {
            if (this.hasConnection(d)) {
                vertices.push(center.add(transform.transformVector(directions.get(d)).scale(0.5)), center);
            }
        }
        return new Part(vertices, PrimitiveType.Lines);
    }

    generateCurves(transform: CubeToOrthoTransform): Curve[] {
        // TODO
        return [];
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
            for (let d = 0; d < directions.size; d++) {
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
            for (let d = 0; d < directions.size; d++) {
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

    generateCurves(transform: CubeToOrthoTransform): Map<number, Curve[]> {
        return new Map(Array.from(this).map(piece => ([piece.id, piece.generateCurves(transform)])));
    }

    createBorderConstraint(): Constraint {
        return (space) => space.map(position => {
            const toDisallow = <Piece[]>[];
            for (let d = 0; d < directions.size; d++) {
                const neighborPosition = position.add(directions.get(d));
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