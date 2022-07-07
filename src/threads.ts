import { v4 as uuid } from "uuid";
import { randInt } from "./utility";

export interface ThreadOptions {
    y: number;
    v?: number;
}

export class Thread {

    y: number;
    v: number = 0;
    id: string;
    threads: Threads;

    constructor(options: ThreadOptions) {
        Object.assign(this, options);
    }

    delete(): void {
        this.threads.deleteQueue.push(this.id);
    }

}

export interface ThreadsOptions {
    numThreads: number;
    height: number;
    tickDur?: number;
}

export class Threads {

    threads = new Map<string, Thread>();
    deleteQueue: string[] = [];
    numThreads: number;
    height: number;
    /** Duration of a tick in ms */
    tickDur = 50;
    tickTimer = 0;
    // TESTING
    splitChance = 0.008;
    deathChance = 0.001;

    constructor(options: ThreadsOptions) {
        Object.assign(this, options);
    }

    createThread(options: ThreadOptions) {
        // Construct thread
        let thread = new Thread(options);
        // Generate ID and attach reference
        thread.id = uuid();
        thread.threads = this;
        this.threads.set(thread.id, thread);
    }

    populate(): void {
        // Testing
        this.createThread({ y: this.height/2 });
    }

    tick(): void {
        for (const thread of this.threads.values()) {
            // TESTING
            if (Math.random() < this.splitChance) {
                this.createThread({
                    y: thread.y,
                    v: thread.v + 0.03 * randInt(-3, 3)
                });
            }
            else if (Math.random() < (this.deathChance * this.threads.size)) {
                thread.delete();
            }
        }
    }

    /**
     * Updates the thread "simulation"
     * @param dt Delta time in ms
     */
    update(dt: number): void {

        // Update tick timer
        this.tickTimer += dt;
        let elapsedTicks = Math.floor(this.tickTimer / this.tickDur); // If this is above 1, we have an issue
        this.tickTimer = this.tickTimer % this.tickDur;

        if (elapsedTicks > 0) {
            this.tick();
            elapsedTicks -= 1;
        }
        if (elapsedTicks > 0) console.log(`Running ${elapsedTicks} ticks behind`);
        
        // Delete threads marked for deletion
        this.deleteQueue.forEach(id => this.threads.delete(id));
        this.deleteQueue = [];

        // Update threads
        for (const thread of this.threads.values()) {
            thread.y += (dt * thread.v);
            // TODO Make it interesting!
            // TESTING
            // Damping
            let damping = 5e-5 * dt;
            if (Math.abs(thread.v) < damping) thread.v = 0;
            else thread.v -= damping * Math.sign(thread.v);
        }

    }

}