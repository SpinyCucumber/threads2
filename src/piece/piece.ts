import { AdjacencyRules, AdjacencyRulesBuilder, Constraint, Tile, TileSet } from "../collapser";
import { CubePosition, CubeToOrthoTransform, directions, getOrInsert, opposite, Position } from "../utility";
import { Part, PrimitiveType } from "../webgl-renderer/part";
import { Curve } from "../utility/curve";
import { List } from "immutable";

export class Piece {

    id: number;
    connections: number;
    connectionList: List<number>;
    weight: number;

    constructor(id: number, connections: number, weight: number) {
        this.id = id;
        this.connections = connections;
        this.connectionList = List(directions.keySeq().filter(d => this.hasConnection(d)));
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

    generateCurves(transform: CubeToOrthoTransform): Immutable.List<Curve> {
        // For pieces with two connections, we create a single curve with the control point in the center.
        const center = transform.transformPosition(new CubePosition({ q: 0, r: 0, s: 0 }));
        function getVertex(d: number): Position {
            return center.add(transform.transformVector(directions.get(d).scale(0.5)));
        }
        if (this.connectionList.size === 2) {
            const [ q, r ] = this.connectionList;
            return List.of(new Curve({ a: getVertex(q), b: center, c: center, d: getVertex(r) }));
        }
        // For all other configurations (0 connections, 1 connection, more than two)
        // we create one curve for each connection which creates a straight line to the center.
        return this.connectionList.map(d => new Curve({ a: getVertex(d), b: center, c: center, d: center }));
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

    generateCurves(transform: CubeToOrthoTransform): Map<number, Immutable.List<Curve>> {
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

    createFilterConstraint(disallowedIds: Iterable<number>, filter: (position: CubePosition) => boolean): Constraint {
        return (space) => space.map(position => {
            const toDisallow = filter(position) ? disallowedIds : [];
            return [position, toDisallow];
        });
    }

    [Symbol.iterator]() {
        return this.map.values();
    }

}