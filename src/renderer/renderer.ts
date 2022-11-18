import { flatten, Position } from "../utility";

const fragmentShaderSource = `
    #version 300 es
    precision mediump float;

    out vec4 fColor;

    void
    main()
    {
        fColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`;

const vertexShaderSource = `
    #version 300 es
        
    uniform vec2 uTranslate;
    in vec4 aPosition;

    void
    main()
    {
        gl_Position = aPosition + vec4(uTranslate, 0, 0);
    }
`;

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
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source.replace(/^\s+|\s+$/g, ''));
    gl.compileShader(shader);
    return shader;
}

function createProgram(gl: WebGL2RenderingContext, ...shaders: WebGLShader[]): WebGLProgram {
    const program = gl.createProgram();
    for (const shader of shaders) gl.attachShader(program, shader);
    gl.linkProgram(program);
    return program;
}

export class Renderer {

    private gl: WebGL2RenderingContext;
    private bakedParts: Map<number, BakedPart>;
    private positionLocation: number;
    private translateLocation: WebGLUniformLocation;
    private placedParts: [number, Float32Array][] = [];

    constructor({ canvas, parts }: RendererOptions) {
        this.gl = canvas.getContext("webgl2");
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        // Bake parts
        this.bakedParts = new Map(Array.from(parts).map(([id, part]) => ([id, part.bake(this.gl)])));
        // Construct shaders
        const vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        // Construct WebGL program
        const program = createProgram(this.gl, vertexShader, fragmentShader);
        // Retrieve variable locations
        this.gl.useProgram(program);
        this.translateLocation = this.gl.getUniformLocation(program, "uTranslate");
        this.positionLocation = this.gl.getAttribLocation(program, "aPosition");
        this.gl.enableVertexAttribArray(this.positionLocation);
    }

    placePart(partID: number, position: Position) {
        this.placedParts.push([partID, flatten([position])]);
    }

    draw() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        for (const [partID, position] of this.placedParts) {
            // Set translate vector
            this.gl.uniform2fv(this.translateLocation, position);
            // Draw buffer
            const { buffer, numVertices, mode } = this.bakedParts.get(partID);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
            this.gl.drawArrays(mode, 0, numVertices);
        }
    }

}