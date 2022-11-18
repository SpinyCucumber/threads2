import { Piece, PieceSet } from "./piece";
import { CubePosition, CubeToOrthoTransform, enumerateSpiral, Position, Vector } from "./utility";
import { Collapser } from "./collapser";
import { Renderer } from "./renderer";
import "./style.scss";

const pieces = new PieceSet([
    new Piece(0, 0b100100, 1),
    new Piece(1, 0b101000, 0.5),
    new Piece(2, 0b100010, 0.5),
    new Piece(3, 0b000101, 0.5),
    new Piece(4, 0b010100, 0.5),
]);

const space = enumerateSpiral(new CubePosition({ q: 0, r: 0, s: 0 }), 6);

const transform = new CubeToOrthoTransform(
    new Vector({ x: 0.06 * Math.sqrt(3), y: 0 }),
    new Vector({ x: 0.06 * Math.sqrt(3)/2, y: 0.06 * 3/2 }),
    new Position({ x: 0, y: 0 }),
);
const parts = pieces.generateParts(transform);

const collapser = new Collapser({
    space,
    tiles: pieces.generateTileSet(),
    rules: pieces.generateAdjacencyRules(),
    noiseFunction: () => 0.05 * Math.random()
});

window.onload = () => {
    // Run collapser
    const tiles = collapser.run();
    console.log(tiles.toJSON());
    // Place parts and render
    const canvas: HTMLCanvasElement = document.querySelector("#canvas");
    const renderer = new Renderer({ canvas, parts, });
    for (const [cubePosition, tile] of tiles) {
        const position = transform.transformPosition(cubePosition);
        renderer.placePart(tile.id, position);
    }
    renderer.draw();
}