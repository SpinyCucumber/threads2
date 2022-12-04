import { Piece, PieceSet } from "./piece";
import { CubePosition, CubeToOrthoTransform, enumerateSpiral, Position, Vector } from "./utility";
import { Collapser } from "./collapser";
import "./style.scss";
import { Renderer } from "./webgl-renderer";

const pieces = new PieceSet([
    new Piece(0, 0b110000, 2),
    new Piece(1, 0b101000, 2),
    new Piece(2, 0b100100, 2),
    new Piece(3, 0b100010, 2),
    new Piece(4, 0b100001, 2),
    new Piece(5, 0b011000, 2),
    new Piece(6, 0b010100, 2),
    new Piece(7, 0b010010, 2),
    new Piece(8, 0b010001, 2),
    new Piece(9, 0b001100, 2),
    new Piece(10, 0b001010, 2),
    new Piece(11, 0b001001, 2),
    new Piece(12, 0b000110, 2),
    new Piece(13, 0b000101, 2),
    new Piece(14, 0b000011, 2),
    new Piece(15, 0b100000, 0.001),
    new Piece(16, 0b010000, 0.001),
    new Piece(17, 0b001000, 0.001),
    new Piece(18, 0b000100, 0.001),
    new Piece(19, 0b000010, 0.001),
    new Piece(20, 0b000001, 0.001),
    new Piece(21, 0b000000, 0.001),
]);

const space = enumerateSpiral(new CubePosition({ q: 0, r: 0, s: 0 }), 6);

const transform = new CubeToOrthoTransform(
    new Vector({ x: 0.05 * Math.sqrt(3), y: 0 }),
    new Vector({ x: 0.05 * Math.sqrt(3)/2, y: 0.05 * 3/2 }),
    new Position({ x: 0, y: 0 }),
);
const parts = pieces.generateParts(transform);

const collapser = new Collapser({
    space,
    tiles: pieces.generateTileSet(),
    rules: pieces.generateAdjacencyRules(),
    constraints: [pieces.createBorderConstraint()],
    noiseFunction: () => 0 * Math.random()
});

window.onload = async () => {
    // Run collapser
    const { tiles, history } = collapser.run();
    // Render tiles!
    const canvas: HTMLCanvasElement = document.querySelector("#canvas");
    const renderer = new Renderer({ canvas, parts });

    for (const cubePosition of history) {
        const tile = tiles.get(cubePosition);
        const position = transform.transformPosition(cubePosition);
        console.log(`${position}`);
        // Draw piece part at position
        renderer.drawPart(tile.id, position);
    }

}