import assert from "./assert";
import { Consumer } from "./FunctionTypes";

type TimeoutId = number;

export default class RateLimiter<T> {
    private minDelay: number;
    private lastRealUpdate: number = performance.now();
    private nextValue: T | null = null;
    private timeout: TimeoutId | undefined = undefined;
    private updateConsumer: Consumer<T>;

    /**
     * Limits the rate at which an update consumer is called.
     * @param minDelay Unit: ms. The minimum delay between updates.
     * @param updateConsumer Gets called for new values.
     */
    constructor(minDelay: number, updateConsumer: Consumer<T>) {
        assert(minDelay > 0);
        this.minDelay = minDelay;
        this.updateConsumer = updateConsumer;
    }

    setValue(newValue: T): void {
        if (this.timeout !== undefined) {
            this.nextValue = newValue;
            return;
        }

        const now = performance.now();
        const delay = now - this.lastRealUpdate;

        if (delay >= this.minDelay) {
            this.lastRealUpdate = now;
            this.updateConsumer(newValue);
            return;
        }

        const scheduleDelay = this.minDelay - delay;

        this.timeout = setTimeout(() => {
            this.timeout = undefined;

            if (this.nextValue !== null) {
                this.updateConsumer(this.nextValue);
                this.nextValue = null;
            }
        }, scheduleDelay) as unknown as TimeoutId;
    }

    abort(): void {
        if (this.timeout !== undefined) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }
}
