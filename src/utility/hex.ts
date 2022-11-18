import * as Immutable from "immutable";
import { Position, Vector } from "./ortho";

export class CubePosition extends Immutable.Record({ q: 0, r: 0, s: 0, }) {

    /**
     * Adding a vector to a position produces a position
     */
    add(v: CubeVector): CubePosition {
        return new CubePosition({ q: this.q + v.q, r: this.r + v.r, s: this.s + v.s });
    }

    /**
     * Substracting a position from a position produces a vector
     */
    subtract(p: CubePosition): CubeVector {
        return new CubeVector({ q: this.q - p.q, r: this.r - p.r, s: this.s - p.s });
    }

}

/**
 * A hexagonal vector described using cube coordinates.
 * Unlike positions, vectors can be scaled and rotated.
 */
export class CubeVector extends Immutable.Record({ q: 0, r: 0, s: 0, }) {
    
    add(v: CubeVector): CubeVector {
        return new CubeVector({ q: this.q + v.q, r: this.r + v.r, s: this.s + v.s });
    }

    scale(f: number) {
        return new CubeVector({ q: f * this.q, r: f * this.r, s: f * this.s });
    }

    /**
     * Rotates this hex vector 60 degrees clockwise
     */
    rotateRight() {
        return new CubeVector({ q: -this.r, r: -this.s, s: -this.q });
    }

    /**
     * Rotates this hex vector 60 degrees counter-clockwise
     */
    rotateLeft() {
        return new CubeVector({ q: -this.s, r: -this.q, s: -this.r });
    }

}

export class CubeToOrthoTransform {
    
    qBasis: Vector;
    rBasis: Vector;
    origin: Position;

    constructor(
        qBasis = new Vector({ x: Math.sqrt(3), y: 0 }),
        rBasis = new Vector({ x: Math.sqrt(3)/2, y: 3/2 }),
        origin = new Position({ x: 0, y: 0 })
    ) {
        this.qBasis = qBasis;
        this.rBasis = rBasis;
        this.origin = origin;
    }

    transformPosition(p: CubePosition): Position {
        return this.origin.add(this.qBasis.scale(p.q)).add(this.rBasis.scale(p.r));
    }

    transformVector(v: CubeVector): Vector {
        return this.qBasis.scale(v.q).add(this.rBasis.scale(v.r));
    }

}

/**
 * Enumerates the six possible directions in a cube coordinate system
 */
export function *enumerateDirections(): Generator<CubeVector> {
    let v = new CubeVector({ q: 1, r: 0, s: -1 });
    for (let i = 0; i < 6; i++) {
        yield v;
        v = v.rotateRight();
    }
}

export function *enumerateRing(center: CubePosition, radius: number): Generator<CubePosition> {
    let p = center.add(direction(4).scale(radius));
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < radius; j++) {
            yield p;
            p = p.add(direction(i));
        }
    }
}

export function *enumerateSpiral(center: CubePosition, radius: number): Generator<CubePosition> {
    yield center;
    for (let i = 0; i < radius; i++) {
        yield *enumerateRing(center, i + 1);
    }
}

export function opposite(d: number) {
    return (d + 3) % 6;
}

export function direction(d: number) {
    return directions[d];
}

const directions = Array.from(enumerateDirections());

export const numDirections = directions.length;