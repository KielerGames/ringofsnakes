const formatter = new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 2
});

export default class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static fromObject(p: VectorLike): Vector {
        return new Vector(p.x, p.y);
    }

    static distance(a: Vector, b: Vector): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Linear interpolation between two Vectors.
     * @param a the t=0 Vector
     * @param b the t=1 Vector
     * @param t should be between 0 and 1
     * @returns interpolated Vector
     */
    static lerp(a: Vector, b: Vector, t: number): Vector {
        const s = 1.0 - t;
        return new Vector(s * a.x + t * b.x, s * a.y + t * b.y);
    }

    /**
     * Returns true if both Vectors are equal or sufficiently close.
     * @param epsilon should be small and >= 0
     */
    static equals(a: Vector, b: Vector, epsilon: number): boolean {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        return d2 < epsilon * epsilon;
    }

    addPolar(alpha: number, distance: number): void {
        this.x += distance * Math.cos(alpha);
        this.y += distance * Math.sin(alpha);
    }

    createTransferable(): VectorLike {
        return this;
    }

    set(data: VectorLike): void {
        this.x = data.x;
        this.y = data.y;
    }

    clone(): Vector {
        return new Vector(this.x, this.y);
    }

    toString(): string {
        const f = formatter.format;
        return `<${f(this.x)},${f(this.y)}>`;
    }
}

export type VectorLike = {
    x: number;
    y: number;
};
