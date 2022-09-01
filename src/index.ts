import { Collapser, Tile } from "./collapser";
import { Renderer } from "./renderer";
import "./style.scss";

const tiles = [
    [0b00001000, 5],
    [0b10001000, 75],
    [0b00001001, 10],
    [0b01001000, 10],
    [0b10000100, 10],
    [0b10010000, 10],
    [0b00010001, 10],
    [0b01000100, 10],
    [0b10000000, 5],
    [0b00000000, 1],
].map(([connections, frequency], index) => new Tile(connections, frequency, index));

const width = 20;
const height = 20;
const margin = 20;
const collapser = new Collapser({ width, height, tiles, noiseFunction: () => 0.01 * Math.random() });
const grid = collapser.run();

window.onload = () => {
    const canvas: HTMLCanvasElement = document.querySelector("#canvas");
    // Render tiles
    const context = canvas.getContext("2d");
    context.lineWidth = 0.3;
    context.strokeStyle = "white";
    context.lineCap = "round";
    context.translate(margin, margin);
    const renderer = new Renderer({
        tiles,
        scaleX: (canvas.width - 2*margin) / width,
        scaleY: (canvas.height - 2*margin) /height
    });
    renderer.run(grid, context);
}