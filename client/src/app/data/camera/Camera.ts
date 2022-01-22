import Vector from "../../math/Vector";
import Snake from "../snake/Snake";

export default class Camera {
    #position: Vector = new Vector(0, 0);


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
}
