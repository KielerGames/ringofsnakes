let currentTime = performance.now();

/**
 * @returns the time in ms for the current frame. 
 */
export function now(): number {
    return currentTime;
}

/**
 * This should be called once per frame.
 */
export function update(): void {
    currentTime = performance.now();
}
