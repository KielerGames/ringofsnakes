import Vector from "../../math/Vector";
import Matrix, { ReadonlyMatrix } from "../../math/Matrix";
import Snake from "../snake/Snake";
import Rectangle from "../../math/Rectangle";

const WORLD_SCALE = 0.042;
const SCALE_MATRIX = new Matrix(true);
SCALE_MATRIX.setEntry(0, 0, WORLD_SCALE);
SCALE_MATRIX.setEntry(1, 1, WORLD_SCALE);

export default class Camera {
    #position: Vector = new Vector(0, 0);

    #unstretch: Matrix = new Matrix(true);
    #translation: Matrix = new Matrix(true);

    #lastTransformMatrix: ReadonlyMatrix | null = null;

    setRatio(width: number, height: number): void {
        this.#unstretch.setEntry(0, 0, height / width);
    }

    moveToSnake(snake: Snake): void {
        this.moveTo(snake.position);
    }

    moveTo(position: Vector): void {
        this.#position.set(position);
        this.#lastTransformMatrix = null;
        // TODO
    }

    computeScreenCoordinates(worldPosition: Readonly<Vector>, canvas: HTMLCanvasElement): Vector {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
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
        return this.#position;
    }

    get transformMatrix(): ReadonlyMatrix {
        if (this.#lastTransformMatrix === null) {
            const pos = this.#position;
            this.#translation.setEntry(0, 2, -pos.x);
            this.#translation.setEntry(1, 2, -pos.y);

            this.#lastTransformMatrix = Matrix.compose(
                Matrix.compose(this.#unstretch, SCALE_MATRIX),
                this.#translation
            );
        }

        return this.#lastTransformMatrix;
    }

    get viewBox(): Rectangle {
        const center = this.#position;
        const ratio = this.#unstretch.getEntry(0, 0);

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
