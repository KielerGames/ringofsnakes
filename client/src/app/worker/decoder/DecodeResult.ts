export type DecodeResult<T> = {
    data: T;
    nextByteOffset: number;
};
