import { Tile } from "./collapser";
import { Vector, Grid } from "./utility";

const possibleColors: string[] = [
    "#ffffff",
    "#ff6600",
    "#336699",
];

type Curve = Vector[]

function bakeTile(tile: Tile): Curve | undefined {
    // If tile has two connections, tile is non-terminal.
    // The endpoints of the curve are the edges/corners corresponding to the connection.
    // If the tile has only one connection, the tile is terminal.
    // In this case, one endpoint is the connecion, and the other is the center of the tile.
    // If the tile has zero connections (empty tile), return nothing
    if (tile.connections.size === 0) return;
    const center = new Vector(0, 0);
    const connections = Array.from(tile.connections).map(direction => direction.vector);
    const start = connections.pop();
    const end = connections.pop() || center;
    return [start, center, center, end];
}

class Thread {

    color: string

    constructor() {
        // Randomly pick color (uniformly)
        this.color = possibleColors[Math.floor(Math.random() * possibleColors.length)];
    }

}

function tagTiles(tileGrid: Grid<Tile>): Grid<Thread> {

    const { width, height } = tileGrid;

    const tagGrid = new Grid<Thread>(width, height);

    // Iteratively tags a group of connected tiles
    function tagThread(start: Vector) {
        // Create thread
        const thread = new Thread();
        const positionStack: Vector[] = [start];
        let toTag: Vector;

        while (toTag = positionStack.pop()) {
            // Tag position with thread
            tagGrid.set(toTag, thread);
            // Attempt to tag neighbors
            for (const direction of tileGrid.get(toTag).connections) {
                const neighborPosition = toTag.sum(direction.vector);
                if (!tileGrid.isValidPosition(neighborPosition)) continue;
                // If neighbor has already been tagged, skip
                // Otherwise add neighbor position to stack
                if (tagGrid.get(neighborPosition) !== undefined) continue;
                positionStack.push(neighborPosition);
            }
        }
    }

    // Tag all positions
    for (const position of tileGrid.keys()) {
        if (tagGrid.get(position) !== undefined) continue;
        tagThread(position);
    }

    return tagGrid;

}

interface RendererInitializer {
    tiles: Tile[]
    scaleX: number
    scaleY: number
}

export class Renderer {

    bakedTiles: Map<Tile, Curve | undefined>
    scaleX: number
    scaleY: number

    constructor({ tiles, scaleX, scaleY }: RendererInitializer) {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.bakedTiles = new Map(tiles.map(tile => (
            [tile, bakeTile(tile)]
        )));
    }

    run(tileGrid: Grid<Tile>, context: CanvasRenderingContext2D) {
        // Tag contiguous groups of tiles (threads)
        const tagGrid = tagTiles(tileGrid);
        // Convert grid of tiles to grid of curves
        const curveGrid = tileGrid.map(tile => this.bakedTiles.get(tile));
        for (const [position, curve] of curveGrid.entries()) {
            if (curve === undefined) continue;
            const odd = Boolean((position.x + position.y) % 2);
            context.globalCompositeOperation = odd ? "destination-over" : "source-over";
            // Retrieve thread at position
            const thread = tagGrid.get(position);
            context.strokeStyle = thread.color;
            this.renderCurve(curve, position, context);
        }
    }

    renderCurve(curve: Curve, position: Vector, context: CanvasRenderingContext2D) {
        console.debug(`Rendering curve at ${position}`);
        // Apply transform based on position
        context.save();
        context.scale(this.scaleX/2, this.scaleY/2);
        context.translate(position.x * 2 + 1, position.y * 2 + 1);
        // Draw bezier curve
        context.beginPath();
        context.moveTo(curve[0].x, curve[0].y);
        context.bezierCurveTo(curve[1].x, curve[1].y, curve[2].x, curve[2].y, curve[3].x, curve[3].y);
        context.stroke();
        // Restore previous canvas state
        context.restore();
    }

}