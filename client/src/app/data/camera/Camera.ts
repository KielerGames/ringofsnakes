import Vector from "../../math/Vector";
import Matrix, { ReadonlyMatrix } from "../../math/Matrix";
import Snake from "../snake/Snake";
import Rectangle from "../../math/Rectangle";

const WORLD_SCALE = 0.042;
const SCALE_MATRIX = new Matrix(true);
SCALE_MATRIX.setEntry(0, 0, WORLD_SCALE);
SCALE_MATRIX.setEntry(1, 1, WORLD_SCALE);

export default class Camera {
    private _position: Vector = new Vector(0, 0);

    private _unstretch: Matrix = new Matrix(true);
    private _translation: Matrix = new Matrix(true);

    private _lastTransformMatrix: ReadonlyMatrix | null = null;

    setRatio(width: number, height: number): void {
        this._unstretch.setEntry(0, 0, height / width);
    }

    moveToSnake(snake: Snake): void {
        this.moveTo(snake.position);
    }

    moveTo(position: Vector): void {
        this._position.set(position);
        this._lastTransformMatrix = null;
        // TODO
    }

    computeScreenCoordinates(
        worldPosition: Readonly<Vector>,
        width: number,
        height: number
    ): Vector {
        const glPosition = this.transformMatrix.multiply(worldPosition);

        // flip y
        glPosition.y *= -1;

        // transform to [0, width]
        glPosition.x += 1;
        glPosition.x = width * 0.5 * glPosition.x;

        // transform to [0, height]
        glPosition.y += 1;
        glPosition.y = height * 0.5 * glPosition.y;

        return glPosition;
    }

    get position(): Vector {
        return this._position;
    }

    get transformMatrix(): ReadonlyMatrix {
        if (this._lastTransformMatrix === null) {
            const pos = this._position;
            this._translation.setEntry(0, 2, -pos.x);
            this._translation.setEntry(1, 2, -pos.y);

            this._lastTransformMatrix = Matrix.compose(
                Matrix.compose(this._unstretch, SCALE_MATRIX),
                this._translation
            );
        }

        return this._lastTransformMatrix;
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
