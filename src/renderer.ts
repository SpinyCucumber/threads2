import { Threads, ThreadsOptions } from "./threads";

export interface ThreadsRendererOptions {
    canvas: HTMLCanvasElement;
    threadsOptions: ThreadsOptions;
}

export class ThreadsRenderer {

    canvas: HTMLCanvasElement;
    threadsOptions: ThreadsOptions;
    threads: Threads;

    constructor(options: ThreadsRendererOptions) {
        Object.assign(this, options);
    }

    public start(): void {
        // Create new Threads
        this.threads = new Threads(this.threadsOptions);

    }

}