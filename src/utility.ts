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

    sum(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    diff(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    scaledBy(s: number): Vector {
        return new Vector(s * this.x, s * this.y);
    }

    perp(): Vector {
        return new Vector(-this.y, this.x);
    }

}

/**
 * One of the eight cardinal/ordinal directions. Supports finding the opposite direction.
 * directions are indexed in clockwise order from the top left, and each direction is assigned a vector.
 */
export class Direction {

    vector: Vector
    index: number

    constructor(vector: Vector, index: number) {
        this.vector = vector;
        this.index = index;
    }

    get opposite(): Direction {
        return directions[(this.index + 4) % 8];
    }

}

/**
 * A simple 2D grid
 */
export class Grid<T> {

    private cells: T[][];
    width: number
    height: number

    constructor(width: number, height: number, initializer: (x: number, y: number) => T) {
        this.width = width;
        this.height = height;
        this.cells = [...Array(height).keys()].map(y => (
            [...Array(width).keys()].map(x => initializer(x, y))
        ))
    }

    get(position: Vector): T {
        return this.cells[position.y][position.x];
    }

}

function* enumerateDirections() {
    let d = new Vector(-1, -1);
    let v = new Vector(0, 1);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 2; j++) {
            yield d;
            d = d.sum(v);
        }
        v = v.perp();
    }
}

export function sum(array: number[]): number {
    return array.reduce((a, b) => a + b, 0);
}

export const directions = Array.from(enumerateDirections()).map((vector, index) => new Direction(vector, index));