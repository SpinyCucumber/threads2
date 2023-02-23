import { Piece, PieceSet } from "./piece";
import { CubePosition, CubeToOrthoTransform, enumerateSpiral, Position, sleep, Vector } from "./utility";
import { runAttempts } from "./collapser";
import "./style.scss";
import { Renderer } from "./canvas-renderer";
import { List } from "immutable";

const pieces = new PieceSet([

    // Straights
    new Piece(2, 0b100100, 1),
    new Piece(7, 0b010010, 1),
    new Piece(11, 0b001001, 1),

    // Curves
    new Piece(1, 0b101000, 1),
    new Piece(6, 0b010100, 1),
    new Piece(10, 0b001010, 1),
    new Piece(13, 0b000101, 1),
    new Piece(3, 0b100010, 1),
    new Piece(8, 0b010001, 1),

    // Bends
    // new Piece(0, 0b110000, 0.0001),
    // new Piece(5, 0b011000, 0.0001),
    // new Piece(9, 0b001100, 0.0001),
    // new Piece(12, 0b000110, 0.0001),
    // new Piece(14, 0b000011, 0.0001),
    // new Piece(4, 0b100001, 0.0001),

    // Ends
    // new Piece(15, 0b100000, 0.25),
    // new Piece(16, 0b010000, 0.5),
    // new Piece(17, 0b001000, 7),
    // new Piece(18, 0b000100, 7),
    // new Piece(19, 0b000010, 7),
    // new Piece(20, 0b000001, 0.5),

    // Forks
    // new Piece(22, 0b101010, 0.25),
    // new Piece(23, 0b010101, 0.5),
    // new Piece(38, 0b110101, 0.5),

    // "lambda" Forks
    new Piece(26, 0b110100, 0.5),
    new Piece(27, 0b101100, 0.5),
    new Piece(28, 0b100110, 0.5),
    new Piece(29, 0b100101, 0.5),

    new Piece(30, 0b110010, 0.5),
    new Piece(31, 0b011010, 0.5),
    new Piece(32, 0b010110, 0.5),
    new Piece(33, 0b010011, 0.5),

    new Piece(34, 0b101001, 0.5),
    new Piece(35, 0b011001, 0.5),
    new Piece(36, 0b001101, 0.5),
    new Piece(37, 0b001011, 0.5),

    // Empty
    new Piece(21, 0b000000, 5),

]);

const r = 7;
const space = List(enumerateSpiral(new CubePosition({ q: 0, r: 0, s: 0 }), r));

const transform = new CubeToOrthoTransform(
    new Vector({ x: 20 * Math.sqrt(3), y: 0 }),
    new Vector({ x: 20 * Math.sqrt(3)/2, y: 20 * 3/2 }),
    new Position({ x: 200, y: 200 }),
);
const curves = pieces.generateCurves(transform);

const collapserOptions = {
    space,
    tiles: pieces.generateTileSet(),
    rules: pieces.generateAdjacencyRules(),
    constraints: [
        pieces.createBorderConstraint(),
    ],
    noiseFunction: () => 0.5 * Math.random()
};

const maxAttempts = 10;

window.onload = async () => {
    // Run collapser
    const { tiles, history } = runAttempts(collapserOptions, maxAttempts);
    // Render tiles!
    const canvas: HTMLCanvasElement = document.querySelector("#canvas");
    const renderer = new Renderer({ canvas });

    for (const cubePosition of history) {

        const tile = tiles.get(cubePosition);
        const position = transform.transformPosition(cubePosition);

        if (tile.id === 21) {
            // Draw nothing
        }
        else {
            // Draw piece's curves at position
            for (const curve of curves.get(tile.id)) {
                renderer.strokeCurve(position, curve);
            }
            await sleep(10);
        }

    }

}