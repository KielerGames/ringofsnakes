import assert from "../../util/assert";
import { Consumer } from "../../util/FunctionTypes";

type TimeoutId = number;

export default class RateLimiter<T> {
    #minDelay: number;
    #lastRealUpdate: number = performance.now();
    #nextValue: T | null = null;
    #timeout: TimeoutId | undefined = undefined;
    #updateConsumer: Consumer<T>;

    /**
     * Limits the rate at which an update consumer is called.
     * @param minDelay Unit: ms. The minimum delay between updates.
     * @param updateConsumer Gets called for new values.
     */
    constructor(minDelay: number, updateConsumer: Consumer<T>) {
        assert(minDelay > 0);
        this.#minDelay = minDelay;
        this.#updateConsumer = updateConsumer;
    }

    setValue(newValue: T): void {
        if (this.#timeout !== undefined) {
            this.#nextValue = newValue;
            return;
        }

        const now = performance.now();
        const delay = now - this.#lastRealUpdate;

        if (delay >= this.#minDelay) {
            this.#lastRealUpdate = now;
            this.#updateConsumer(newValue);
            return;
        }

        const scheduleDelay = this.#minDelay - delay;

        this.#timeout = setTimeout(() => {
            this.#timeout = undefined;

            if (this.#nextValue !== null) {
                this.#updateConsumer(this.#nextValue);
                this.#nextValue = null;
            }
        }, scheduleDelay) as any as TimeoutId;
    }

    abort(): void {
        if (this.#timeout !== undefined) {
            clearTimeout(this.#timeout);
            this.#timeout = undefined;
        }
    }
}