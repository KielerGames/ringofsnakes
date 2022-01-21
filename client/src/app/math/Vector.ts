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

    static fromObject(p: PointLike): Vector {
        return new Vector(p.x, p.y);
    }

    static distance(a: Vector, b: Vector): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static lerp(a: Vector, b: Vector, t: number): Vector {
        const s = 1.0 - t;
        return new Vector(s * a.x + t * b.x, s * a.y + t * b.y);
    }

    addPolar(alpha: number, distance: number): void {
        this.x += distance * Math.cos(alpha);
        this.y += distance * Math.sin(alpha);
    }

    createTransferable(): PointLike {
        return { x: this.x, y: this.y };
    }

    set(data: PointLike): void {
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

type PointLike = {
    x: number;
    y: number;
};
