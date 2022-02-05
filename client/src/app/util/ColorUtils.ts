export type RGBAFloatColor = [number, number, number, number];

export function mix(a: RGBAFloatColor, b: RGBAFloatColor, s: number): RGBAFloatColor {
    s = Math.max(0.0, Math.min(s, 1.0));

    if (s === 0.0) {
        return a;
    } else if (s === 1.0) {
        return b;
    }

    const t = 1.0 - s;

    return [t * a[0] + s * b[0], t * a[1] + s * b[1], t * a[2] + s * b[2], t * a[3] + s * b[3]];
}
