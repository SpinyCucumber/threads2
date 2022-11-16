/**
 * A simple 2D Vector class supporting addition, subtraction, scaling, etc.
 */
 export class Vector {

    x: number
    y: number

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    subtract(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    scaledBy(s: number): Vector {
        return new Vector(s * this.x, s * this.y);
    }

    perp(): Vector {
        return new Vector(-this.y, this.x);
    }

    toString(): string {
        return `(${this.x}, ${this.y})`;
    }

}