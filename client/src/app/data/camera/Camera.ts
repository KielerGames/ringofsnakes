import Vector from "../../math/Vector";
import Matrix from "../../math/Matrix";
import Snake from "../snake/Snake";
import Rectangle from "../../math/Rectangle";

const WORLD_SCALE = 0.042;
const SCALE_MATRIX = new Matrix();
SCALE_MATRIX.setEntry(0, 0, WORLD_SCALE);
SCALE_MATRIX.setEntry(1, 1, WORLD_SCALE);

export default class Camera {
    private _position: Vector = new Vector(0, 0);

    private _unstretch: Matrix = new Matrix();
    private _translation: Matrix = new Matrix();

    setRatio(width: number, height: number): void {
        this._unstretch.setEntry(0, 0, height / width);
    }

    moveToSnake(snake: Snake): void {
        this.moveTo(snake.position);
    }

    moveTo(position: Vector): void {
        this._position.set(position);
        // TODO
    }

    get position(): Vector {
        return this._position;
    }

    get transformMatrix(): Matrix {
        const pos = this._position;
        this._translation.setEntry(0, 2, -pos.x);
        this._translation.setEntry(1, 2, -pos.y);

        return Matrix.compose(Matrix.compose(this._unstretch, SCALE_MATRIX), this._translation);
    }

    get viewBox(): Rectangle {
        const center = this._position;
        const ratio = this._unstretch.getEntry(0, 0);

        // the WebGL viewbox has width & height 2: [-1,1] x [-1,1]
        const width = 2.0 / (ratio * WORLD_SCALE);
        const height = 2.0 / WORLD_SCALE;

        return new Rectangle(
            center.x - 0.5 * width,
            center.x + 0.5 * width,
            center.y - 0.5 * height,
            center.y + 0.5 * height
        );
    }
}
