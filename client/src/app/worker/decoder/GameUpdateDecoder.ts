import * as SID from "./SnakeInfoDecoder";
import * as SCD from "./SnakeChunkDecoder";
import * as FCD from "./FoodDecoder";
import * as ArrayDecoder from "./ArrayDecoder";
import { GameConfig } from "../../data/config/GameConfig";
import { FoodChunkDTO } from "../../data/dto/FoodChunkDTO";
import { SnakeDTO } from "../../data/dto/SnakeDTO";
import { SnakeChunkDTO } from "../../data/dto/SnakeChunkDTO";

const UPDATE_HEADER_SIZE = 5;

export function decode(config: GameConfig, buffer: ArrayBuffer): DecodedGameUpdate {
    const view = new DataView(buffer);

    // read update header
    const ticksSinceLastUpdate = view.getUint8(0);
    const numSnakeInfos = view.getUint8(1);
    const numSnakeChunks = view.getUint8(2);
    const numFoodChunks = view.getUint8(3);
    const hasHeatMap = view.getUint8(4) !== 0;

    // read snake infos
    const { data: snakeInfos, nextByteOffset: chunkOffset } = ArrayDecoder.decode(
        SID.decode,
        config,
        numSnakeInfos,
        buffer,
        UPDATE_HEADER_SIZE
    );

    // read chunks
    const { data: chunks, nextByteOffset: foodOffset } = ArrayDecoder.decode(
        SCD.decode,
        config,
        numSnakeChunks,
        buffer,
        chunkOffset
    );

    // read food
    const { data: foodChunks, nextByteOffset: heatMapOffset } = ArrayDecoder.decode(
        FCD.decode,
        config,
        numFoodChunks,
        buffer,
        foodOffset
    );

    let heatMap = undefined;
    let endPosition = heatMapOffset;
    if (hasHeatMap) {
        const heatMapLength = config.chunks.rows * config.chunks.columns;
        endPosition += heatMapLength;
        const heatMapBufferView = new Uint8Array(buffer, heatMapOffset, heatMapLength);
        // copy data into new array
        heatMap = new Uint8Array(heatMapBufferView);
    }

    if (endPosition !== buffer.byteLength) {
        console.error(
            `Unexpected update buffer size (expected ${endPosition}, was ${buffer.byteLength})`
        );
    }

    return {
        ticksSinceLastUpdate,
        snakeInfos,
        snakeChunkData: chunks,
        foodChunkData: foodChunks,
        heatMap
    };
}

export type DecodedGameUpdate = {
    ticksSinceLastUpdate: number;
    snakeInfos: SnakeDTO[];
    snakeChunkData: SnakeChunkDTO[];
    foodChunkData: FoodChunkDTO[];
    heatMap?: Uint8Array;
};
