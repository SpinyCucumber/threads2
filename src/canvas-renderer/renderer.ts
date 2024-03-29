import { Position, sleep } from "../utility";
import { Curve } from "../utility/curve";

export interface RendererOptions {
    canvas: HTMLCanvasElement;
}

export class Renderer {

    private context: CanvasRenderingContext2D;
    private numDivisions = 3;

    constructor({ canvas }: RendererOptions) {
        this.context = canvas.getContext("2d");
        this.context.lineWidth = 5.0;
        this.context.strokeStyle = "white";
        this.context.lineCap = "round";
    }

    // TODO Cache segments?
    strokeCurve(position: Position, curve: Curve) {
        // Transform context
        this.context.save();
        this.context.translate(position.x, position.y);
        // Sample curve and draw segments
        const segments = curve.sample(this.numDivisions);
        for (const [a, b] of segments) {
            this.context.beginPath();
            this.context.moveTo(a.x, a.y);
            this.context.lineTo(b.x, b.y);
            this.context.stroke();
        }
        // Restore context
        this.context.restore();
    }

}