import * as Immutable from "immutable";

export class Position extends Immutable.Record({ x: 0, y: 0 }) {

    /**
     * Adding a vector to a position produces a position
     */
    add(v: Vector): Position {
        return new Position({ x: this.x + v.x, y: this.y + v.y });
    }

    /**
     * Subtracting a position from a position produces a vector
     */
    subtract(p: Position): Vector {
        return new Vector({ x: this.x - p.x, y: this.y - p.y });
    }

}

export class Vector extends Immutable.Record({ x: 0, y: 0 }) {

    add(v: Vector): Vector {
        return new Vector({ x: this.x + v.x, y: this.y + v.y });
    }

    scale(f: number): Vector {
        return new Vector({ x: f * this.x, y: f * this.y });
    }

}

export function flatten(vertices: (Position | Vector)[]): Float32Array {
    const array = new Float32Array(2 * vertices.length);
    for (let i = 0; i < vertices.length; i++) {
        array[2*i] = vertices[i].x;
        array[2*i + 1] = vertices[i].y;
    }
    return array;
}