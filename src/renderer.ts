import { Threads } from "./threads";

export interface ThreadsRendererOptions {
    ctx: CanvasRenderingContext2D,
    threads: Threads;
    speed?: number;
    ctxOptions?: { strokeStyle: string, lineWidth: number, lineCap: string };
}

export class ThreadsRenderer {

    /** The canvas rendering context */
    ctx: CanvasRenderingContext2D;
    ctxOptions = { strokeStyle: "white", lineWidth: 5, lineCap: "round" };
    threads: Threads;
    /** The y position of each thread in the last frame */
    lastY = new Map<string, number>();
    lastX: number;
    speed: number = 0.05;

    constructor(options: ThreadsRendererOptions) {
        Object.assign(this, options);
    }

    public reset() {
        this.lastX = 0;
    }

    /**
     * Renders threads
     * @param dt Delta time in ms
     */
    public render(dt: number): void {
        // Push rendering context
        this.ctx.save();
        Object.assign(this.ctx, this.ctxOptions);
        // Render threads
        let x = this.lastX + (dt * this.speed);
        if (this.lastX) {
            for (const { y, id } of this.threads.threads) {
                let lastY = this.lastY.get(id);
                if (lastY) {
                    // Render individual thread
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.lastX, lastY);
                    this.ctx.lineTo(x, y);
                    this.ctx.stroke();
                }
                // Update last y position
                this.lastY.set(id, y);
            }
        }
        // Update last x position
        this.lastX = x;
        // Pop rendering context
        this.ctx.restore();
    }

}