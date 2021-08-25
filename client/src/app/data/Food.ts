export default class Food {
    public readonly x: number;
    public readonly y: number;
    public readonly size: number;
    public readonly color: number;

    public constructor(x: number, y: number, size: number, color: number) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
    }
}
