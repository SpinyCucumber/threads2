import { flatten, initShaders, Position } from "../utility";

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

export interface BakedPart {
    buffer: WebGLBuffer;
    numVertices: number;
    mode: number;
}

interface RendererOptions {
    canvas: HTMLCanvasElement;
    parts: Iterable<[number, Part]>,
    vertexShaderID: string,
    fragmentShaderID: string,
}

export class Renderer {

    private gl: WebGL2RenderingContext;
    private bakedParts: Map<number, BakedPart>;
    private positionLocation: number;
    private placedParts: number[]

    constructor({ canvas, parts, vertexShaderID, fragmentShaderID }: RendererOptions) {
        this.gl = canvas.getContext("webgl2");
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        // Bake parts
        this.bakedParts = new Map(Array.from(parts).map(([id, part]) => ([id, part.bake(this.gl)])));
        // Initialize shaders
        const program: WebGLProgram = initShaders(this.gl, vertexShaderID, fragmentShaderID);
        this.gl.useProgram(program);
        this.positionLocation = this.gl.getAttribLocation(program, "aPosition");
        this.gl.enableVertexAttribArray(this.positionLocation);
    }

    placePart(partID: number) {
        this.placedParts.push(partID);
    }

    draw() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        for (const partID of this.placedParts) {
            const { buffer, numVertices, mode } = this.bakedParts.get(partID);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
            this.gl.drawArrays(mode, 0, numVertices);
        }
    }

}