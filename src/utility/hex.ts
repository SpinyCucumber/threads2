import * as Immutable from "immutable";

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
    let p = center.add(directions[4].scale(radius));
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < radius; j++) {
            yield p;
            p = p.add(directions[i]);
        }
    }
}

export function *enumerateSpiral(center: CubePosition, radius: number): Generator<CubePosition> {
    yield center;
    for (let i = 0; i < radius; i++) {
        yield *enumerateRing(center, i + 1);
    }
}

export const directions = Array.from(enumerateDirections());