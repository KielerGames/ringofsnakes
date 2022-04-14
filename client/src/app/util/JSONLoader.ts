type TypeGuard<T> = (data: unknown) => data is T;

const defaultGuard = function <T>(data: unknown): data is T {
    // the default guard accepts any data
    return true;
};

type LoadOptions<T> = {
    allowCache?: boolean;
    guard?: TypeGuard<T>;
};

export async function loadJSON<T>(path: string, options: LoadOptions<T> = {}): Promise<T> {
    // initialize options
    const allowCache = options.allowCache ?? false;
    const guard = options.guard ?? defaultGuard;

    const response = await fetch(path, {
        method: "GET",
        cache: allowCache ? "default" : "no-store"
    });

    if (!response.ok) {
        return Promise.reject(new Error(`Request failed (${path})`));
    }

    const data = await response.json();

    if (guard(data)) {
        return data;
    } else {
        return Promise.reject(new Error("Invalid data."));
    }
}
