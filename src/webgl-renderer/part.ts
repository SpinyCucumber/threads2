import { flatten, Position } from "../utility";

export interface PrimitiveType {
    getID: (gl: WebGL2RenderingContext) => number
}

export namespace PrimitiveType {

    export const Lines: PrimitiveType = {
        getID: gl => gl.LINES,
    };

    export const Points: PrimitiveType = {
        getID: gl => gl.POINTS,
    };

}

export interface BakedPart {
    buffer: WebGLBuffer;
    numVertices: number;
    mode: number;
}

export class Part {

    vertices: Position[]
    primitiveType: PrimitiveType;

    constructor(vertices: Position[], primitiveType: PrimitiveType) {
        this.vertices = vertices;
        this.primitiveType = primitiveType;
    }

    bake(gl: WebGL2RenderingContext): BakedPart {
        // Create buffer and populate with vertex data
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);
        return {
            buffer,
            numVertices: this.vertices.length,
            mode: this.primitiveType.getID(gl),
        };
    }

}