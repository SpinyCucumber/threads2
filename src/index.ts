import { Piece, PieceSet } from "./piece";
import { CubePosition, CubeToOrthoTransform, enumerateSpiral, Position, Vector } from "./utility";
import { Collapser } from "./collapser";
import { Renderer } from "./renderer";
import "./style.scss";

const pieces = new PieceSet([
    new Piece(0, 0b100100, 6),
    new Piece(1, 0b101000, 2),
    new Piece(2, 0b100010, 2),
    new Piece(3, 0b000101, 2),
    new Piece(4, 0b010100, 2),
    new Piece(5, 0b010010, 2),
    new Piece(6, 0b001001, 2),
    new Piece(7, 0b001010, 2),
    new Piece(8, 0b010001, 2),
    new Piece(9, 0b100000, 0.1),
    new Piece(10, 0b000100, 0.1),
    new Piece(11, 0b010000, 0.1),
    new Piece(12, 0b001000, 0.1),
    new Piece(13, 0b000010, 0.1),
    new Piece(14, 0b000001, 0.1),
]);

const space = enumerateSpiral(new CubePosition({ q: 0, r: 0, s: 0 }), 7);

const transform = new CubeToOrthoTransform(
    new Vector({ x: 0.06 * Math.sqrt(3), y: 0 }),
    new Vector({ x: 0.06 * Math.sqrt(3)/2, y: -0.06 * 3/2 }),
    new Position({ x: 0, y: 0 }),
);
const parts = pieces.generateParts(transform);

const collapser = new Collapser({
    space,
    tiles: pieces.generateTileSet(),
    rules: pieces.generateAdjacencyRules(),
    noiseFunction: () => 0.01 * Math.random()
});

window.onload = () => {
    // Run collapser
    const tiles = collapser.run();
    // Place parts and render
    const canvas: HTMLCanvasElement = document.querySelector("#canvas");
    const renderer = new Renderer({ canvas, parts, });
    for (const [position, tile] of tiles) {
        renderer.placePart(tile.id, transform.transformPosition(position));
    }
    renderer.draw();
}