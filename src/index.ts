import { Piece, PieceSet } from "./piece";
import { CubePosition, enumerateSpiral } from "./utility";
import { Collapser } from "./collapser";
import "./style.scss";

const pieces = new PieceSet([
    new Piece(0, 0b100100, 1),
    new Piece(1, 0b101000, 0.5),
    new Piece(2, 0b100010, 0.5),
    new Piece(3, 0b000101, 0.5),
    new Piece(4, 0b010100, 0.5),
]);

const space = enumerateSpiral(new CubePosition({ q: 0, r: 0, s: 0 }), 4);

const collapser = new Collapser({
    space,
    tiles: pieces.generateTileSet(),
    rules: pieces.generateAdjacencyRules(),
    noiseFunction: () => 0.05 * Math.random()
});

window.onload = () => {
    const canvas: HTMLCanvasElement = document.querySelector("#canvas");
    // TODO
    const tiles = collapser.run();
    console.log(tiles.toJSON());
}