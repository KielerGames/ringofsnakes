export function clamp(lower: number, value: number, upper: number): number {
    return Math.max(lower, Math.min(value, upper));
}
