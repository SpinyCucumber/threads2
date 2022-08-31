import { Tile } from "./collapser";
import { Vector, Grid } from "./utility";

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

    run(grid: Grid<Tile>, context: CanvasRenderingContext2D) {
        // Convert grid of tiles to grid of curves
        const curveGrid = grid.map(tile => this.bakedTiles.get(tile));
        for (const [position, curve] of curveGrid.entries()) {
            if (curve) this.renderCurve(curve, position, context);
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