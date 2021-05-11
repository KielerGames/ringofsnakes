import Vector from "../math/Vector";
import Snake from "./Snake";

export abstract class Camera {
    protected lastPosition: Vector;

    public constructor(pos: Vector) {
        this.lastPosition = pos;
    }

    public abstract update(timeSinceLastUpdate: number): void;

    public get position(): Vector {
        return this.lastPosition;
    }
}

export class TargetCamera extends Camera {
    private targetPosition: Vector;
    private maxSpeed2: number;

    public constructor(x: number, y: number, maxSpeed: number = 14) {
        super(new Vector(x, y));
        this.targetPosition = new Vector(x, y);
        this.maxSpeed2 = maxSpeed * maxSpeed;
    }

    public static createAt(pos: Vector, maxSpeed: number = 14): TargetCamera {
        return new TargetCamera(pos.x, pos.y, maxSpeed);
    }

    public setTargetPosition(target: { x: number; y: number }): void {
        this.targetPosition.set(target);
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
        const len2 = mx * mx + my * my;
        if (len2 > this.maxSpeed2 * t2) {
            let s = Math.sqrt(this.maxSpeed2 / len2);
            mx = mx * s;
            my = my * s;
        }

        this.lastPosition.x += mx;
        this.lastPosition.y += my;
    }
}

export class SnakeCamera extends Camera {
    private snake: Snake | undefined;

    public constructor(snake?: Snake) {
        super(new Vector(0, 0));
        this.snake = snake;
        if (snake) {
            this.lastPosition.set(snake.getPredictedPosition(0));
        }
    }

    public update(timeSinceLastUpdate: number): void {
        if (this.snake) {
            this.lastPosition.set(
                this.snake.getPredictedPosition(timeSinceLastUpdate)
            );
        }
    }

    public setTargetSnake(snake?: Snake) {
        this.snake = snake;
    }
}
