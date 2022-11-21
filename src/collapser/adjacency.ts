import { getOrInsert, opposite } from "../utility";

export class AdjacencyRulesBuilder {

    private compatibleTiles = new Map<number, Map<number, number[]>>();

    withCompatibleTile(from: number, to: number, direction: number): AdjacencyRulesBuilder {
        const tilesByDirection = getOrInsert(this.compatibleTiles, from, () => new Map<number, number[]>);
        const tiles = getOrInsert(tilesByDirection, direction, () => <number[]>[]);
        tiles.push(to);
        return this;
    }

    withRule(from: number, to: number, direction: number): AdjacencyRulesBuilder {
        this.withCompatibleTile(from, to, direction);
        this.withCompatibleTile(to, from, opposite(direction));
        return this;
    }

    build(): AdjacencyRules {
        return new AdjacencyRules(this.compatibleTiles);
    }

}

export class AdjacencyRules {

    private compatibleTiles: Map<number, Map<number, number[]>>;
    readonly enablerCounts: Map<number, Map<number, number>>;

    constructor(compatibleTiles: Iterable<[number, Iterable<[number, number[]]>]>) {
        this.compatibleTiles = new Map(Array.from(compatibleTiles).map(
            ([tile, tilesByDirection]) => ([tile, new Map(tilesByDirection)])
        ));
        // Compute enablers from compatible tiles
        this.enablerCounts = new Map<number, Map<number, number>>();
        for (const [tile, compatibleTilesByDirection] of this.compatibleTiles) {
            for (const [direction, compatibleTiles] of compatibleTilesByDirection) {
                const enablersByDirection = getOrInsert(this.enablerCounts, tile, () => new Map<number, number>());
                enablersByDirection.set(direction, compatibleTiles.length);
            }
        }
    }

    getCompatibleTiles(id: number): IterableIterator<[number, number[]]> {
        return this.compatibleTiles.get(id).entries();
    }

}