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
    currentTime = time;
}
