import assert from "./assert";

let currentTime = 0.0;

/**
 * @returns the time in ms for the current frame.
 */
export function now(): number {
    return currentTime;
}

/**
 * This should be called once per frame.
 * @param time the time in milliseconds.
 */
export function update(time: number = performance.now()): void {
    if (time !== 0.0) {
        assert(time >= currentTime, `Time cannot go backwards (${time} < ${currentTime})`);
    }
    currentTime = time;
}
