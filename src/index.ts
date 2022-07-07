import { Threads } from "./threads";
import { ThreadsRenderer } from "./renderer";
import { resizeCanvas } from "./utility";

// Import styles
import "./style.scss";

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let threads: Threads;
let renderer: ThreadsRenderer;
let lastTime: number;

// Declare game loop
function gameLoop(time: number): void {
    // Update timer
    const dt = time - lastTime;
    lastTime = time;
    // Render/update stuff
    threads.update(dt);
    renderer.render(dt);
    window.requestAnimationFrame(gameLoop);
    // Resize the canvas if necessary
    if (canvas.width < renderer.lastX) {
        resizeCanvas(canvas, 2*canvas.width, canvas.height);
    }
}

function start(): void {
    // Get canvas and update canvas width/height
    canvas = document.querySelector("canvas");
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    // Construct Threads and renderer
    ctx = canvas.getContext("2d");
    threads = new Threads({ height: canvas.height, numThreads: 1 });
    renderer = new ThreadsRenderer({ ctx, threads });
    // Initialize threads, renderer, and start game loop
    lastTime = window.performance.now();
    threads.populate();
    renderer.reset();
    window.requestAnimationFrame(gameLoop);
}

window.addEventListener('load', start);