const requests = new Map<string, Promise<Response>>();

class LoadingStage {
    #previous: LoadingStage | null = null;
    #numRequested = 0;
    #numCompleted = 0;
    #completion: Promise<void> = Promise.resolve();

    constructor(previous?: LoadingStage) {
        this.#previous = previous ?? null;
    }

    loadJSON<ResultType>(url: string, guard?: TypeGuard<ResultType>): Promise<ResultType> {
        return this.#fetch(url, async (response) => {
            guard = guard ?? defaultGuard;
            const data = await response.json();

            if (guard(data)) {
                return data;
            } else {
                throw new Error("Invalid JSON data.");
            }
        });
    }

    loadImage(url: string, size?: number): Promise<HTMLImageElement>;
    loadImage(url: string, width: number, height: number): Promise<HTMLImageElement>;
    loadImage(url: string, width?: number, height?: number): Promise<HTMLImageElement> {
        if (width !== undefined && height === undefined) {
            height = width;
        }

        return this.#fetch(url, async (response) => {
            const blob = await response.blob();
            const blobURL = URL.createObjectURL(blob);
            const image = new Image(width, height);
            await new Promise((resolve, reject) => {
                image.onload = resolve;
                image.onerror = reject;
                image.src = blobURL;
            });
            URL.revokeObjectURL(blobURL);
            return image;
        });
    }

    loadWorker(url: string): Promise<Blob> {
        return this.#fetch(url, (response) => response.blob());
    }

    get progress(): number {
        if (this.#numRequested === 0) {
            return 0;
        }
        return this.#numCompleted / this.#numRequested;
    }

    async waitForCompletion(): Promise<void> {
        if (this.#numRequested === 0) {
            await sleep(0);
            if (this.#numRequested === 0) {
                console.error(this);
                throw new Error("Loading failed.");
            }
            return await this.waitForCompletion();
        }

        while (this.#numCompleted < this.#numRequested) {
            await this.#completion;
            await sleep(0);
        }
    }

    #waitForStart(): Promise<void> {
        if (this.#previous === null) {
            return Promise.resolve();
        }

        return this.#previous.waitForCompletion();
    }

    #fetch<T>(url: string, mapFunc: (response: Response) => Promise<T>): Promise<T> {
        // Promises of a loading stage should execute concurrently (not sequentially).
        const promise = (async () => {
            await this.#waitForStart();
            this.#numRequested++;
            const response = await getResponse(url);
            const result = await mapFunc(response);
            this.#numCompleted++;
            return result;
        })();

        this.#completion = Promise.all([this.#completion, promise]).then(() => undefined);

        return promise;
    }
}

export const MAIN = new LoadingStage();
export const PREGAME = new LoadingStage();

async function getResponse(url: string): Promise<Response> {
    // Reuse previous request if possible.
    let promise = requests.get(url);

    if (promise === undefined) {
        // Make a new request assuming no changes if the client version has not changed.
        promise = fetch(url + "?v=" + encodeURIComponent(__VERSION__), {
            method: "GET",
            cache: __DEBUG__ ? "no-store" : "force-cache"
        });
        // Store the promise before it has finished loading so it can be reused immediately.
        requests.set(url, promise);
    }

    const response = await promise;

    if (!response.ok) {
        throw new Error(`Failed to load (status ${response.status}): ${url}`);
    }

    return response;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function defaultGuard<T>(data: unknown): data is T {
    // the default guard accepts any data
    return true;
}

type TypeGuard<T> = (data: unknown) => data is T;
