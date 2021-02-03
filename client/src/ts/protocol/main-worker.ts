export type MessageFromMain = ConnectRequest;

export type MessageFromWorker = SnakeChunkData;

// ======================================
// Messages from Main Thread to Worker:
// ======================================

export type ConnectRequest = {
    tag: "ConnectRequest";
    playerName: string;
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
    glVertexBuffer: ArrayBuffer;
    viewBox: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
    length: number;
};