import { Collapser, Tile } from "./collapser";
import { Vector } from "./utility";

const tiles = [
    [0b00001000, 1],
    [0b10001000, 4],
    [0b00001001, 1],
    [0b01001000, 1],
    [0b10000100, 1],
    [0b10010000, 1],
    [0b00010001, 1],
    [0b01000100, 1],
    [0b10000000, 1],
].map(([connections, frequency], index) => new Tile(connections, frequency, index));

const width = 10;
const height = 10;
const collapser = new Collapser(width, height, tiles, () => 0);
const grid = collapser.run();

const tileSymbols = [
    " x-", "---", " \\--", "/--", "--/", "--\\", " \\ ", " / ", "-x "
];

for (let y = 0; y < height; y++) {
    console.log([...Array(width).keys()].map(x => {
        const tile = grid.get(new Vector(x, y));
        return tileSymbols[tile.index];
    }).join(" "));
}