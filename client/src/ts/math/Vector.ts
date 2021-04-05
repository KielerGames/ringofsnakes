export default class Vector {
    public x: number;
    public y: number;

    public static fromObject(p: PointLike): Vector {
        return new Vector(p.x, p.y);
    }

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public addPolar(alpha: number, distance: number): void {
        this.x += distance * Math.cos(alpha);
        this.y += distance * Math.sin(alpha);
    }

    public createTransferable(): PointLike {
        return { x: this.x, y: this.y };
    }

    public set(data: PointLike): void {
        this.x = data.x;
        this.y = data.y;
    }
}

type PointLike = {
    x: number;
    y: number;
};
