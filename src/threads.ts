import { v4 as uuid } from "uuid";

export interface Thread {
    row: number;
    id: string;
}

export interface ThreadsOptions {
    size: number;
}

export class Threads {

    threads: Thread[] = [];
    steps: number = 0;
    size: number;

    constructor(options: ThreadsOptions) {
        Object.assign(this, options);
    }

    populate() {
        this.threads.push({
            row: Math.floor(this.size/2),
            id: uuid(),
        });
    }

    step() {
        // TODO
        for (const thread of this.threads) {
            thread.row += (2*this.steps - 1);
        }
        this.steps += 1;
    }

}