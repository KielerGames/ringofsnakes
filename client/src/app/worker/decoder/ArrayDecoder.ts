import { GameConfig } from "../../data/config/GameConfig";
import assert from "../../util/assert";
import { DecodeResult } from "./DecodeResult";

type ItemDecoder<T> = (
    buffer: ArrayBuffer,
    offset: number,
    config: GameConfig
) => DecodeResult<T>;

export function decode<T>(
    itemDecoder: ItemDecoder<T>,
    config: GameConfig,
    numberOfItems: number,
    buffer: ArrayBuffer,
    offset: number
): DecodeResult<T[]> {
    const items: T[] = new Array(numberOfItems);

    for (let i = 0; i < numberOfItems; i++) {
        const { data, nextByteOffset } = itemDecoder(buffer, offset, config);
        items[i] = data;
        assert(nextByteOffset > offset);
        offset = nextByteOffset;
    }

    return {
        data: items,
        nextByteOffset: offset
    };
}
