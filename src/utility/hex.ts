class AxialPosition {

    q: number;
    r: number;
    
    constructor(q: number, r: number) {
        this.q = q;
        this.r = r;
    }

    /**
     * Adding a vector to a position produces a position
     */
    add(v: AxialVector): AxialPosition {
        return new AxialPosition(this.q + v.q, this.r + v.r);
    }

    /**
     * Substracting a position from a position produces a vector
     */
    subtract(p: AxialPosition): AxialVector {
        return new AxialVector(this.q - p.q, this.r - p.r);
    }

}

class AxialVector {

    q: number;
    r: number;
    
    constructor(q: number, r: number) {
        this.q = q;
        this.r = r;
    }
    
    add(v: AxialVector): AxialVector {
        return new AxialVector(this.q + v.q, this.r + v.r);
    }

    scale(s: number) {
        return new AxialVector(s * this.q, s * this.r);
    }

}

function *enumerateGrid(x: number): Generator<AxialPosition> {
    
}