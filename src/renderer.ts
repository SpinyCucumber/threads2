import { Threads } from "./threads";

export interface ThreadsRendererOptions {
    threads: Threads;
    speed?: number;
}

const defaults: Partial<ThreadsRendererOptions> = {
    speed: 0.01
}

export class ThreadsRenderer {

    /** The canvas to render to */
    canvas: HTMLCanvasElement;
    /** The canvas rendering context */
    ctx: CanvasRenderingContext2D;
    threads: Threads;
    /** The y position of each thread in the last frame */
    lastY = new Map<string, number>();
    lastX: number;
    speed: number;

    constructor(options: ThreadsRendererOptions) {
        Object.assign(this, {...defaults, ...options});
        // Create rendering context
        this.ctx = this.canvas.getContext("2d");
        this.ctx.lineWidth = 20;
    }

    public reset() {
        this.lastX = 0;
    }

    /**
     * Renders threads
     * @param dt Delta time in ms
     */
    public render(dt: number): void {
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
    }

}