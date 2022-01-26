/**
 * Normalize the angle to [-pi,pi].
 */
export function normalizeAngle(alpha: number): number {
    if (!Number.isFinite(alpha)) {
        return 0.0;
    }

    while (Math.abs(alpha) > Math.PI) {
        alpha -= Math.sign(alpha) * 2.0 * Math.PI;
    }

    return alpha;
}

const fullCircle = 2.0 * Math.PI;

/**
 * Get the minimum |d| s.t. normalized(a + d) = b
 * @param a normalized angle
 * @param b normalized angle
 */
export function getMinDelta(a: number, b: number): number {
    const d1 = b - a;
    const d2 = d1 - Math.sign(d1) * fullCircle;
    return Math.abs(d2) < Math.abs(d1) ? d2 : d1;
}

export function toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}
