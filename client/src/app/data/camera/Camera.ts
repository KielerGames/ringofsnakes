import Vector from "../../math/Vector";
import Matrix from "../../math/Matrix";
import Snake from "../snake/Snake";
import Rectangle from "../../math/Rectangle";

const WORLD_SCALE = 0.042;
const SCALE_MATRIX = new Matrix();
SCALE_MATRIX.setEntry(0, 0, WORLD_SCALE);
SCALE_MATRIX.setEntry(1, 1, WORLD_SCALE);

export default class Camera {
    #position: Vector = new Vector(0, 0);

    #unstretch: Matrix = new Matrix();
    #translation: Matrix = new Matrix();

    setRatio(width: number, height: number): void {
        this.#unstretch.setEntry(0, 0, height / width);
    }

    moveToSnake(snake: Snake): void {
        this.moveTo(snake.position);
    }

    moveTo(position: Vector): void {
        this.#position.set(position);
        // TODO
    }

    get position(): Vector {
        return this.#position;
    }

    get transformMatrix(): Matrix {
        const pos = this.#position;
        this.#translation.setEntry(0, 2, -pos.x);
        this.#translation.setEntry(1, 2, -pos.y);

        return Matrix.compose(
            Matrix.compose(this.#unstretch, SCALE_MATRIX),
            this.#translation
        );
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
