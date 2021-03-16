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
}

type PointLike = {
    x: number;
    y: number;
};
