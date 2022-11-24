const requests = new Map<string, Promise<Response>>();

class LoadingStage {
    #previous: LoadingStage | null = null;
    #numRequested = 0;
    #numCompleted = 0;

    constructor(previous?: LoadingStage) {
        this.#previous = previous ?? null;
    }

    waitForCompletion(): Promise<void> {
        // TODO
        return Promise.resolve();
    }

    async loadJSON<ResultType>(url: string, guard?: TypeGuard<ResultType>): Promise<ResultType> {
        guard = guard ?? defaultGuard;
        await this.#waitForStart();
        this.#numRequested++;
        const response = await getResponse(url);
        const data = await response.json();
        this.#numCompleted++;

        if (guard(data)) {
            return data;
        } else {
            return Promise.reject(new Error("Invalid JSON data."));
        }
    }

    async loadImage(url: string): Promise<HTMLImageElement> {
        await this.#waitForStart();
        this.#numRequested++;
        const response = await getResponse(url);
        const blob = await response.blob();
        const blobURL = URL.createObjectURL(blob);
        const image = new Image();
        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
            image.src = blobURL;
        });
        URL.revokeObjectURL(blobURL);
        this.#numCompleted++;
        return image;
    }

    async loadWorker(url: string): Promise<Blob> {
        await this.#waitForStart();
        this.#numRequested++;
        const response = await getResponse(url);
        const blob = await response.blob();
        this.#numCompleted++;
        return blob;
    }

    get progress(): number {
        if (this.#numRequested === 0) {
            return 0;
        }
        return this.#numCompleted / this.#numRequested;
    }

    #waitForStart(): Promise<void> {
        if (this.#previous === null) {
            return Promise.resolve();
        }

        return this.#previous.waitForCompletion();
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
        requests.set(url, promise);
    }

    const response = await promise;

    if (!response.ok) {
        return Promise.reject(new Error(`Failed to load (status ${response.status}): ${url}`));
    }

    return response;
}

function defaultGuard<T>(data: unknown): data is T {
    // the default guard accepts any data
    return true;
}

type TypeGuard<T> = (data: unknown) => data is T;
