import { Threads } from "./threads";
import { ThreadsRenderer } from "./renderer";

// Get canvas and update canvas width/height
const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Construct threads
const threads = new Threads({ size: canvas.height, numThreads: 1 });

// Construct renderer
const renderer = new ThreadsRenderer({ canvas, threads });

// Declare game loop
function gameLoop(time: number): void {
    // Update timer
    const dt = time - lastTime;
    lastTime = time;
    // Render/update stuff
    threads.update(dt);
    renderer.render(dt);
    window.requestAnimationFrame(gameLoop);
}

// Initialize threads, renderer, and start game loop
let lastTime = window.performance.now();
threads.populate();
renderer.reset();
window.requestAnimationFrame(gameLoop);