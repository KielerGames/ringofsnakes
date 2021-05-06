import Vector from "../math/Vector";

export default class Camera {
    private lastPosition: Vector;
    private targetPosition: Vector;

    public constructor(x: number, y: number) {
        this.lastPosition = new Vector(x, y);
        this.targetPosition = new Vector(x, y);
    }

    public setTargetPosition(target: { x: number; y: number }): void {
        this.targetPosition.set(target);
    }

    public get position(): Vector {
        return this.lastPosition;
    }

    public update(timeSinceLastUpdate: number): void {
        const t = timeSinceLastUpdate;

        // position delta
        const dx = this.targetPosition.x - this.lastPosition.x;
        const dy = this.targetPosition.y - this.lastPosition.y;

        // const len = Math.sqrt(dx*dx + dy*dy);

        // const sx = len < 1e-5 ? 0.0 : dx/len;
        // const sy = len < 1e-5 ? 0.0 : dy/len;

        const c = 0.25;
        //const s = 0.24 * 25;

        this.lastPosition.x = (1.0 - c) * this.lastPosition.x + c * dx;
        this.lastPosition.y = (1.0 - c) * this.lastPosition.y + c * dy;
    }
}
