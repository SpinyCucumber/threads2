import { v4 as uuid } from "uuid";

export interface ThreadOptions {
    y: number;
    v?: number;
}

export class Thread {

    y: number;
    v: number = 0;
    id: string;

    constructor(options: ThreadOptions) {
        Object.assign(this, options);
        this.id = uuid();
    }

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
        this.threads.push(new Thread({ y: this.size/2 }));
    }

    /**
     * Updates the thread "simulation"
     * @param dt Delta time in ms
     */
    update(dt: number) {
        // TODO
        for (const thread of this.threads) {
            thread.y += (dt * thread.v);
        }
    }

}