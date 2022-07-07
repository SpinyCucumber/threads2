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

    constructor(options: ThreadOptions) {
        Object.assign(this, options);
        this.id = uuid();
    }

}

export interface ThreadsOptions {
    numThreads: number;
    height: number;
    tickDur?: number;
}

export class Threads {

    threads: Thread[] = [];
    numThreads: number;
    height: number;
    /** Duration of a tick in ms */
    tickDur = 50;
    tickTimer = 0;
    // TESTING
    splitChance = 0.008;

    constructor(options: ThreadsOptions) {
        Object.assign(this, options);
    }

    populate(): void {
        // Testing
        this.threads.push(new Thread({ y: this.height/2 }));
    }

    tick(): void {
        for (const thread of this.threads) {
            // TESTING
            if (Math.random() < this.splitChance) {
                this.threads.push(new Thread({
                    y: thread.y,
                    v: thread.v + 0.03 * randInt(-3, 3)
                }));
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

        // Update threads
        for (const thread of this.threads) {
            thread.y += (dt * thread.v);
            // TODO Make it interesting!
            // TESTING
            // Damping
            let damping = 1e-4 * dt;
            if (Math.abs(thread.v) < damping) thread.v = 0;
            else thread.v -= damping * Math.sign(thread.v);
        }

    }

}