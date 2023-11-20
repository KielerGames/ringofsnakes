/**
 * Verifies the given value is not null or undefined.
 * Throws an error otherwise.
 * The error message will be the second argument or, if omitted, a default one.
 * @param value Value to check.
 * @param message Optional error message.
 * @returns The given value.
 */
export default function requireNonNull<T>(value: T | null | undefined, message?: string): T {
    if (value === null || value === undefined) {
        throw new Error(message ?? "Value is " + value);
    }

    return value;
}
