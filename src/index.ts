import { Threads } from "./threads";
import { ThreadsRenderer } from "./renderer";

// Import styles
import "./style.scss";

let canvas;
let threads;
let renderer;
let lastTime;

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

function start(): void {
    // Update canvas width/height
    canvas = document.querySelector("canvas");
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    // Construct Threads and renderer
    threads = new Threads({ size: canvas.height, numThreads: 1 });
    renderer = new ThreadsRenderer({ canvas, threads });
    // Initialize threads, renderer, and start game loop
    lastTime = window.performance.now();
    threads.populate();
    renderer.reset();
    window.requestAnimationFrame(gameLoop);
}

window.addEventListener('load', start);