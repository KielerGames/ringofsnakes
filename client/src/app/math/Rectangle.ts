import Vector from "./Vector";

/**
 * Represents an axis-aligned rectangle.
 */
export default class Rectangle {
    public readonly minX: number;
    public readonly maxX: number;
    public readonly minY: number;
    public readonly maxY: number;

    public constructor(minX: number, maxX: number, minY: number, maxY: number) {
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;

        if (__DEBUG__) {
            if ([minX, maxX, minY, maxY].find(isNaN) !== undefined) {
                throw new Error(`Rectangle constructor argument was NaN.`);
            }
        }
    }

    public get width(): number {
        return this.maxX - this.minX;
    }

    public get height(): number {
        return this.maxY - this.minY;
    }

    public createTransferable(grow: number = 0): TransferableBox {
        return {
            minX: this.minX - grow,
            maxX: this.maxX + grow,
            minY: this.minY - grow,
            maxY: this.maxY + grow
        };
    }

    public static fromTransferable(obj: Readonly<TransferableBox>): Rectangle {
        return new Rectangle(obj.minX, obj.maxX, obj.minY, obj.maxY);
    }

    /**
     * Computes the squared distance between two `Rectangle` instances.
     * @param a A `Rectangle`
     * @param b Another `Rectangle`
     * @returns Squared distance
     */
    public static distance2(a: Rectangle, b: Rectangle): number {
        let dx = 0.0,
            dy = 0.0;

        if (a.maxX < b.minX) {
            dx = b.minX - a.maxX;
        } else if (b.maxX < a.minX) {
            dx = a.minX - b.maxX;
        }

        if (a.maxY < b.minY) {
            dy = b.minY - a.maxY;
        } else if (b.maxY < a.minY) {
            dy = a.minY - b.maxY;
        }

        return dx * dx + dy * dy;
    }

    public extendTo(
        point: Vector,
        padding: number = Number.EPSILON
    ): Rectangle {
        return new Rectangle(
            Math.min(this.minX, point.x - padding),
            Math.max(this.maxX, point.x + padding),
            Math.min(this.minY, point.y - padding),
            Math.max(this.maxY, point.y + padding)
        );
    }

    public contains(point: Vector): boolean {
        const x = this.minX <= point.x && point.x < this.maxX;
        const y = this.minY <= point.y && point.y < this.maxY;
        return x && y;
    }
}

export type TransferableBox = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
};
