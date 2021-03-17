export default class BoundingBox {
    public minX: number;
    public maxX: number;
    public minY: number;
    public maxY: number;

    public constructor(
        minX: number,
        maxX: number,
        minY: number,
        maxY: number
    ) {
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
}

type TransferableBox = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
};
