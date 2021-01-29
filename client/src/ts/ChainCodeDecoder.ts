export function decode(data:number): DecodedData {
    return {
        fast: (data & FAST_BIT) > 0,
        steps: 1 + ((data & STEPS_MASK)>>4),
        dirDelta: decodeDirectionChange(data & DIRECTION_MASK)
    };
}

function decodeDirectionChange(data:number) {
    const sign = 1 - ((data & 1)<<1);
    const k = sign * Math.floor(data/2);
    return k * MAX_DELTA / 7.0;
}

const MAX_DELTA = Math.PI / 90; // 2deg
const FAST_BIT = 1<<7;
const STEPS_MASK = 7<<4;
const DIRECTION_MASK = 15;

type DecodedData = {
    fast: boolean;
    steps: number;
    dirDelta: number;
};
