import Matrix from "../math/Matrix";
import Rectangle from "../math/Rectangle";
import Vector from "../math/Vector";
import Snake from "./Snake";

const WORLD_SCALE = 0.042;

export abstract class Camera {
    protected lastPosition: Vector;
    private translation = new Matrix();
    private unstretch = new Matrix();
    private scale = new Matrix();

    public constructor(pos: Vector) {
        this.lastPosition = pos;

        this.scale.setEntry(0, 0, WORLD_SCALE);
        this.scale.setEntry(1, 1, WORLD_SCALE);
    }

    public abstract update(timeSinceLastUpdate: number): void;

    public get position(): Vector {
        return this.lastPosition;
    }

    public getTransformMatrix(width: number, height: number): Matrix {
        this.unstretch.setEntry(0, 0, height / width);

        this.translation.setEntry(0, 2, -this.lastPosition.x);
        this.translation.setEntry(1, 2, -this.lastPosition.y);

        return Matrix.compose(
            Matrix.compose(this.unstretch, this.scale),
            this.translation
        );
    }

    public getViewBox(): Rectangle {
        const center = this.lastPosition;
        const ratio = this.unstretch.getEntry(0, 0);
        const width = 1.0 / (ratio * WORLD_SCALE);
        const height = 1.0 / WORLD_SCALE;
        return new Rectangle(
            center.x - 0.5 * width,
            center.x + 0.5 * width,
            center.y - 0.5 * height,
            center.y + 0.5 * height
        );
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
            const s = Math.sqrt(this.maxSpeed2 / len2);
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
