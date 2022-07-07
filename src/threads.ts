import { v4 as uuid } from "uuid";

export interface Thread {
    y: number;
    id: string;
}

export interface ThreadsOptions {
    numThreads: number;
    size: number;
}

export class Threads {

    threads: Thread[] = [];
    numThreads: number;
    size: number;

    constructor(options: ThreadsOptions) {
        Object.assign(this, options);
    }

    populate() {
        // Testing
        this.threads.push({
            y: this.size/2,
            id: uuid(),
        });
    }

    /**
     * Updates the thread "simulation"
     * @param dt Delta time in ms
     */
    update(dt: number) {
        // TODO
        for (const thread of this.threads) {
            
        }
    }

}