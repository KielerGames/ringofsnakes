import { AppEvent } from "./util/AppEvent";
import { Consumer } from "./util/FunctionTypes";

const requests = new Map<string, Promise<Response>>();

export class LoadingStage {
    #previous: LoadingStage | null = null;
    #numRequested = 0;
    #numCompleted = 0;
    #completion: Promise<void> = Promise.resolve();
    #changeEvent = new AppEvent<number>();

    /**
     * If there is a previous stage all loading requests of this stage
     * will wait for the previous stage to complete.
     */
    constructor(previous?: LoadingStage) {
        this.#previous = previous ?? null;
    }

    /**
     * Fetch and parse JSON. The parsed JSON can be validated with a guard function.
     */
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

    /**
     * Load a resource as a blob. Can be used to load worker scripts.
     */
    loadBlob(url: string): Promise<Blob> {
        return this.#fetch(url, (response) => response.blob());
    }

    /**
     * Get the loading progress as a number between 0 and 1.
     */
    get progress(): number {
        if (this.#numRequested === 0) {
            return 0;
        }
        return this.#numCompleted / this.#numRequested;
    }

    /**
     * Get a promise that resolved when all resources associated with
     * this loading task have been successfully loaded.
     */
    async waitForCompletion(): Promise<void> {
        if (this.#numRequested === 0) {
            await nextTick();
            if (this.#numRequested === 0) {
                console.error(this);
                throw new Error("Loading failed.");
            }
            return await this.waitForCompletion();
        }

        while (this.#numCompleted < this.#numRequested) {
            await this.#completion;
            await nextTick();
        }

        this.#changeEvent.done();
    }

    /**
     * Listen for loading progress changes. Listeners will be removed
     * automatically when loading of this stage has completed.
     */
    addChangeListener(onchange: Consumer<number>): void {
        this.#changeEvent.addListener(onchange);
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

        promise.then(() => nextTick()).then(() => this.#changeEvent.trigger(this.progress));

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

function nextTick(): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, 0));
}

function defaultGuard<T>(data: unknown): data is T {
    // the default guard accepts any data
    return true;
}

type TypeGuard<T> = (data: unknown) => data is T;
