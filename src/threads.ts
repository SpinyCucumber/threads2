export interface Thread {
    row: number;
}

export interface ThreadsOptions {
    size: number;
}

export class Threads {

    threads: Thread[] = [];
    options: ThreadsOptions;

    constructor(options: ThreadsOptions) {
        this.options = options;
    }

    populate() {
        this.threads.push({ row: Math.floor(this.options.size/2) });
    }

    step() {
        // TODO
        for (const thread of this.threads) {
            thread.row += 1;
        }
    }

}