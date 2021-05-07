import Vector from "../math/Vector";

export default class Camera {
    private lastPosition: Vector;
    private targetPosition: Vector;
    private maxSpeed2: number;

    public constructor(x: number, y: number, maxSpeed:number = 14) {
        this.lastPosition = new Vector(x, y);
        this.targetPosition = new Vector(x, y);
        this.maxSpeed2 = maxSpeed * maxSpeed;
    }

    public setTargetPosition(target: { x: number; y: number }): void {
        this.targetPosition.set(target);
    }

    public get position(): Vector {
        return this.lastPosition;
    }

    public update(timeSinceLastUpdate: number): void {
        // position delta
        const dx = this.targetPosition.x - this.lastPosition.x;
        const dy = this.targetPosition.y - this.lastPosition.y;

        const c = 0.1;
        let mx = c * dx;
        let my = c * dy;

        // limit speed
        const t2 = timeSinceLastUpdate * timeSinceLastUpdate;
        const len2 = mx*mx + my*my;
        if(len2 > this.maxSpeed2 * t2) {
            let s = Math.sqrt(this.maxSpeed2/len2);
            mx = mx * s;
            my = my * s;
        }

        this.lastPosition.x += mx;
        this.lastPosition.y += my;
    }
}
