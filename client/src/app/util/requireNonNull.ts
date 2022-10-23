export default function requireNonNull<T>(value: T | null | undefined): T {
    if (value === null || value === undefined) {
        throw new Error("Value is " + value);
    }

    return value;
}
