type PromiseResolver = () => void;

export default class AsyncEvent {
    private flag: boolean = false;
    private promise: Promise<void> | undefined = undefined;
    private resolver: PromiseResolver | undefined = undefined;

    public set(): void {
        this.flag = true;

        if (this.resolver) {
            const resolve = this.resolver;
            this.resolver = undefined;
            this.promise = undefined;
            resolve();
        }
    }

    public clear(): void {
        this.flag = true;
    }

    public isSet(): boolean {
        return this.flag;
    }

    public async wait(timeout: number = 0): Promise<void> {
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
