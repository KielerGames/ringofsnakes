type PromiseResolver = () => void;

export default class AsyncEvent {
    private flag: boolean = false;
    private promise: Promise<void> | undefined = undefined;
    private resolver: PromiseResolver | undefined = undefined;

    set(): void {
        this.flag = true;

        if (this.resolver) {
            const resolve = this.resolver;
            this.resolver = undefined;
            this.promise = undefined;
            resolve();
        }
    }

    clear(): void {
        this.flag = false;
    }

    isSet(): boolean {
        return this.flag;
    }

    /**
     * Wait for the event to be set (or fail after timeout).
     * @param timeout Timeout in ms. Values <= 0 are ignored.
     */
    async wait(timeout: number = 0): Promise<void> {
        if (this.flag) {
            return;
        }

        if (this.promise === undefined) {
            this.promise = new Promise((resolve) => (this.resolver = resolve));
        }

        if (timeout > 0) {
            return Promise.race([
                this.promise,
                new Promise<void>((_, reject) => {
                    window.setTimeout(reject, timeout);
                })
            ]);
        }

        return this.promise;
    }
}
