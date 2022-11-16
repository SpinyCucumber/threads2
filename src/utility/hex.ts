export class CubePosition {

    q: number;
    r: number;
    s: number;
    
    constructor(q: number, r: number, s: number) {
        this.q = q;
        this.r = r;
        this.s = s;
    }

    /**
     * Adding a vector to a position produces a position
     */
    add(v: CubeVector): CubePosition {
        return new CubePosition(this.q + v.q, this.r + v.r, this.s + v.s);
    }

    /**
     * Substracting a position from a position produces a vector
     */
    subtract(p: CubePosition): CubeVector {
        return new CubeVector(this.q - p.q, this.r - p.r, this.s - p.s);
    }

}

/**
 * A hexagonal vector described using cube coordinates.
 * Unlike positions, vectors can be scaled and rotated.
 */
export class CubeVector {

    q: number;
    r: number;
    s: number;
    
    constructor(q: number, r: number, s: number) {
        this.q = q;
        this.r = r;
        this.s = s;
    }
    
    add(v: CubeVector): CubeVector {
        return new CubeVector(this.q + v.q, this.r + v.r, this.s + v.s);
    }

    scale(f: number) {
        return new CubeVector(f * this.q, f * this.r, f * this.s);
    }

    /**
     * Rotates this hex vector 60 degrees clockwise
     */
    rotateRight() {
        return new CubeVector(-this.r, -this.s, -this.q);
    }

    /**
     * Rotates this hex vector 60 degrees counter-clockwise
     */
    rotateLeft() {
        return new CubeVector(-this.s, -this.q, -this.r);
    }

}

/**
 * Enumerates the six possible directions in a cube coordinate system
 */
export function *enumerateDirections(): Generator<CubeVector> {
    let v = new CubeVector(1, 0, -1);
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