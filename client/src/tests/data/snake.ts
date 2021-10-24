import Rand from "rand-seed";
import * as SCD from "../../app/worker/decoder/SnakeChunkDecoder";
import WorkerSnakeChunk from "../../app/worker/WorkerSnakeChunk";
import WorkerSnake from "../../app/worker/WorkerSnake";
import { GameConfig } from "../../app/types/GameConfig";

export function createSnakeChunkBuffer(
    numberOfChainCodes: number,
    init = { x: 0, y: 0, alpha: 0 },
    random: Rand | null = new Rand("a random seed")
): ArrayBuffer {
    const data = new Uint8Array(
        SCD.SNAKE_CHUNK_HEADER_SIZE + numberOfChainCodes
    );
    data[4] = numberOfChainCodes;

    const view = new DataView(data.buffer, 0);
    view.setFloat32(9, init.x, false);
    view.setFloat32(13, init.y, false);
    view.setFloat32(5, init.alpha, false);

    if (random) {
        const offset = SCD.SNAKE_CHUNK_HEADER_SIZE;

        for (let i = 0; i < numberOfChainCodes; i++) {
            data[offset + i] = Math.floor(random.next() * 256);
        }
    }

    return data.buffer;
}

export function createGameConfig(speed: number = 0.24): GameConfig {
    return {
        chunks: {
            size: 32,
            columns: 16,
            rows: 16
        },
        snakes: {
            minLength: 6.0,
            maxTurnDelta: Math.PI / 30,
            speed: speed,
            startLength: 8,
            minWidth: 0.5,
            maxWidth: 6.0,
            fastSpeed: 2 * speed,
            burnRate: 0.1
        },
        tickDuration: 1.0 / 25,
        foodNutritionalValue: 1.0,
        foodConversionEfficiency: 0.5,
        selfCollision: false
    };
}

export function createWorkerSnake(): WorkerSnake {
    return new WorkerSnake(
        {
            snakeId: 0,
            currentChunkId: 0,
            skin: 0,
            fast: false,
            length: 42.0,
            direction: 0.0,
            targetDirection: 0.0,
            position: {
                x: 0,
                y: 0
            }
        },
        createGameConfig()
    );
}

export function createWorkerChunk(
    n: number,
    rand = new Rand("workerchunk")
): WorkerSnakeChunk {
    const chunkData = createSnakeChunkBuffer(n, undefined, rand);
    const snake = createWorkerSnake();
    return new WorkerSnakeChunk(
        snake,
        SCD.decode(chunkData, 0, createGameConfig()).data
    );
}
