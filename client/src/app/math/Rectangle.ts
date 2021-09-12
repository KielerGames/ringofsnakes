import assert from "../utilities/assert";

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

        if(__DEBUG__) {
            if([minX, maxX, minY, maxY].find(isNaN) !== undefined) {
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

    public static fromTransferable(obj: TransferableBox): Rectangle {
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
}

type TransferableBox = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
};
