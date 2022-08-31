import { GridCollapser } from "./grid-collapser";
import { Vector } from "./utility";

const width = 5;
const height = 5;
const collapser = new GridCollapser(width, height);
collapser.run();

const tileSymbols = [
    " x-", "---", " \\--", "/--", "--/", "--\\", " \\ ", " / ", "-x "
];

for (let y = 0; y < height; y++) {
    console.log([...Array(width).keys()].map(x => {
        const cell = collapser.grid.get(new Vector(x, y));
        return tileSymbols[cell.value.index];
    }).join(" "));
}