import { Collapser, Tile } from "./collapser";
import { Renderer } from "./renderer";
import "./style.scss";

const tiles = [
    [0b00001000, 1],
    [0b10001000, 8],
    [0b00001001, 4],
    [0b01001000, 4],
    [0b10000100, 4],
    [0b10010000, 4],
    [0b00010001, 4],
    [0b01000100, 4],
    [0b10000000, 1],
].map(([connections, frequency], index) => new Tile(connections, frequency, index));

const width = 20;
const height = 20;
const collapser = new Collapser({ width, height, tiles, noiseFunction: () => 0.1 * Math.random() });
const grid = collapser.run();

window.onload = () => {
    const canvas: HTMLCanvasElement = document.querySelector("#canvas");
    // Render tiles
    const context = canvas.getContext("2d");
    context.lineWidth = 0.3;
    context.strokeStyle = "white";
    context.lineCap = "round";
    const renderer = new Renderer({ tiles, scaleX: canvas.width/width, scaleY: canvas.height/height});
    renderer.run(grid, context);
}