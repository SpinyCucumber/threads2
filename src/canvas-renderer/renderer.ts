import { sleep } from "../utility";
import { Curve } from "../utility/curve";

export interface RendererOptions {
    canvas: HTMLCanvasElement;
}

export class Renderer {

    context: CanvasRenderingContext2D;
    numDivisions: 4;

    constructor({ canvas }: RendererOptions) {
        this.context = canvas.getContext("2d");
    }

    async strokeCurve(curve: Curve, duration: number) {
        const segments = curve.sample(this.numDivisions);
        const period = duration / segments.size;
        for (const [a, b] of segments) {
            this.context.beginPath();
            this.context.moveTo(a.x, a.y);
            this.context.lineTo(b.x, b.y);
            this.context.stroke();
            await sleep(period);
        }
    }

}