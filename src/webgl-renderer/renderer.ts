import { createProgram, createShader, flatten, Position } from "../utility";
import { BakedPart, Part } from "./part";

const fragmentSource: string = require("./shaders/fragment.glsl");
const vertexSource: string = require("./shaders/vertex.glsl");

interface RendererOptions {
    canvas: HTMLCanvasElement;
    parts: Iterable<[number, Part]>,
}

export class Renderer {

    private gl: WebGL2RenderingContext;
    private bakedParts: Map<number, BakedPart>;
    private positionLocation: number;
    private translateLocation: WebGLUniformLocation;

    constructor({ canvas, parts }: RendererOptions) {
        this.gl = canvas.getContext("webgl2");
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        // Bake parts
        this.bakedParts = new Map(Array.from(parts).map(([id, part]) => ([id, part.bake(this.gl)])));
        // Construct shaders
        const vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentSource);
        // Construct WebGL program
        const program = createProgram(this.gl, vertexShader, fragmentShader);
        // Retrieve variable locations
        this.gl.useProgram(program);
        this.translateLocation = this.gl.getUniformLocation(program, "uTranslate");
        this.positionLocation = this.gl.getAttribLocation(program, "aPosition");
        this.gl.enableVertexAttribArray(this.positionLocation);
    }

    startDraw() {        
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    drawPart(partID: number, position: Position) {
        // Set translate vector
        this.gl.uniform2fv(this.translateLocation, flatten([position]));
        // Draw buffer
        const { buffer, numVertices, mode } = this.bakedParts.get(partID);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(mode, 0, numVertices);
    }

}