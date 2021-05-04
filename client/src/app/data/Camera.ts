import Vector from "../math/Vector";

export default class Camera {
    private lastPosition: Vector;
    private velocity: Vector = new Vector(0.0, 0.0);

    public constructor(x: number, y: number) {
        this.lastPosition = new Vector(x, y);
    }

    public setTargetPosition(target: { x: number; y: number }): void {
        this.lastPosition.set(target);
    }

    public get position(): Vector {
        return this.lastPosition;
    }
}
