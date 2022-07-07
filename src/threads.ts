import { v4 as uuid } from "uuid";

export interface Thread {
    pos: number;
    id: string;
}

export interface ThreadsOptions {
    numThreads: number;
    size: number;
}

export class Threads {

    threads: Thread[] = [];
    steps: number = 0;
    numThreads: number;
    size: number;

    constructor(options: ThreadsOptions) {
        Object.assign(this, options);
    }

    populate() {
        // Testing
        this.threads.push({
            pos: this.size/2,
            id: uuid(),
        });
    }

    step() {
        // TODO
        for (const thread of this.threads) {
            /// Update position
        }
        this.steps += 1;
    }

}