export function normalizeAngle(alpha: number): number {
    if (Math.abs(alpha) > Math.PI) {
        alpha += (alpha < 0 ? 2 : -2) * Math.PI;
    }
    return alpha;
}