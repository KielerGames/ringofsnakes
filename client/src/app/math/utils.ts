export function normalizeAngle(alpha: number): number {
    if (!Number.isFinite(alpha)) {
        return 0.0;
    }

    while (Math.abs(alpha) > Math.PI) {
        alpha -= Math.sign(alpha) * 2.0 * Math.PI;
    }

    return alpha;
}

export function toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}
