export type SnakeDTO = {
    id: number;
    length: number;
    width: number;
    skin: number;
    headPosition: { x: number; y: number };
    headDirection: [number, number], // [current direction, target direction]
    fast: boolean;
    headChunkId: number;
};
