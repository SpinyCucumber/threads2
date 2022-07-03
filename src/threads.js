export class Threads {

    threads = [];
    size = 0;

    constructor(initializer) {
        Object.assign(this, initializer);
    }

    populate() {
        this.threads.push({ row: Math.floor(this.size/2) });
    }

    step() {
        // TODO
        for (const thread of this.threads) {
            thread.row += 1;
        }
    }

}