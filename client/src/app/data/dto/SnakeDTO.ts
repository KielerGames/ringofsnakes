export type SnakeDTO = {
    id: number;
    length: number;
    width: number;
    skin: number;
    headPosition: { x: number; y: number };
    headDirection: [number, number]; // [current direction, target direction]
    fast: boolean;
    fastHistory: boolean[]; // [current fast state, previous tick, ...]
    headChunkId: number;
    name?: string;
};
