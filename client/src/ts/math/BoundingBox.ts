/**
 * Represents an axis-aligned rectangle.
 */
export default class BoundingBox {
    public minX: number;
    public maxX: number;
    public minY: number;
    public maxY: number;

    public constructor(minX: number, maxX: number, minY: number, maxY: number) {
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
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
            maxY: this.maxY + grow,
        };
    }

    public static fromTransferable(obj: TransferableBox): BoundingBox {
        return new BoundingBox(obj.minX, obj.maxX, obj.minY, obj.maxY);
    }

    /**
     * Computes the squared distance between two BoundingBox instances.
     * @param a A BoundingBox
     * @param b Another BoundingBox
     * @returns Squared distance
     */
    public static distance2(a: BoundingBox, b: BoundingBox): number {
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

        return dx*dx + dy*dy;
    }
}

type TransferableBox = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
};
