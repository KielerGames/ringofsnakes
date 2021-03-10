import { GameConfig } from "./client-server";

export type MessageFromMain = ConnectToServer | UpdateUserInput;

export type MessageFromWorker = { tag: "GameUpdateData"; data: GameUpdateData };

// ======================================
// Messages from Main Thread to Worker:
// ======================================

export type ConnectToServer = {
    tag: "ConnectToServer";
    playerName: string;
};

export type UpdateUserInput = {
    tag: "UpdateUserInput";
    alpha: number;
    fast: boolean;
};

// ======================================
// Messages from Worker to Main Thread:
// ======================================

/* Vertex buffer triangle strip:
 *   3--2
 *   | /|
 *   |/ |
 *   2--1
 */
export type SnakeChunkData = {
    snakeId: number;
    chunkId: number;

    glVertexBuffer: ArrayBuffer;
    vertices: number;
    viewBox: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };

    end: {
        x: number;
        y: number;
    };

    length: number;
    offset: number;
    full: boolean;
};

export type SnakeInfo = {
    snakeId: number;
    skin: number;
    fast: boolean;
    length: number;
    direction: number;
    position: {
        x: number;
        y: number;
    };
};

export type GameUpdateData = {
    targetSnakeId: number;
    snakeInfos: SnakeInfo[];
    chunkData: SnakeChunkData[];
    gameConfig: GameConfig;
};
