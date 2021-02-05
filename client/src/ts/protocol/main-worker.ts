export type MessageFromMain = ConnectToServer | UpdateTargetAlpha | RunTest;

export type MessageFromWorker = SnakeChunkData;

// ======================================
// Messages from Main Thread to Worker:
// ======================================

export type ConnectToServer = {
    tag: "ConnectToServer";
    playerName: string;
};

export type UpdateTargetAlpha = {
    tag: "UpdateTargetAlpha";
    alpha: number
}

export type RunTest = {
    tag: "RunTest";
}

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
    vertices: number;
    viewBox: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
    length: number;
};