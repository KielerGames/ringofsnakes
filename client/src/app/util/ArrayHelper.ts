type ItemProducer<T> = (index: number) => T;

/**
 * Generate an array with n elements of the form
 * ```
 * [producer(0), producer(1), ..., producer(n)]
 * ```
 * @param n Size of the array.
 * @param producer Function that creates array entries based on an index.
 */
export function generateArray<T>(n: number, producer: ItemProducer<T>): T[] {
    return Array.from({ length: n }, (_, i) => producer(i));
}
