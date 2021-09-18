import { assert } from "chai";
import Rand from "rand-seed";
import { SnakeCamera, TargetCamera } from "../app/data/Camera";
import Snake from "../app/data/Snake";
import Vector from "../app/math/Vector";
import { createGameConfig } from "./data/snake";

function createRandomPoint(rand: Rand, maxValue: number): Vector {
    const x = (2 * rand.next() - 1) * maxValue;
    const y = (2 * rand.next() - 1) * maxValue;
    return new Vector(x, y);
}

describe("Camera", () => {
    beforeEach(() => {
        // @ts-ignore
        global.performance = {
            now: () => 0.0
        };
    });

    describe("TargetCamera", () => {
        it("should not move", () => {
            const rand = new Rand("stationary seed");
            const cam = TargetCamera.createAt(createRandomPoint(rand, 42.0));
            const { x, y } = cam.position;

            for (let i = 0; i < 100; i++) {
                cam.update(rand.next());
                assert.equal(cam.position.x, x);
                assert.equal(cam.position.y, y);
            }

            cam.setTargetPosition({ x, y });
            for (let i = 0; i < 100; i++) {
                cam.update(rand.next());
                assert.equal(cam.position.x, x);
                assert.equal(cam.position.y, y);
            }
        });

        it("should move towards the target", () => {
            const rand = new Rand("moving seed");
            const cam = TargetCamera.createAt(
                createRandomPoint(rand, 42.0),
                2.71828
            );
            const target = createRandomPoint(rand, 100);

            let distance = Vector.distance(cam.position, target);
            cam.setTargetPosition(target);

            for (let i = 0; i < 42; i++) {
                cam.update(1 / 60);
                const d = Vector.distance(cam.position, target);
                assert.isBelow(d, distance);
                distance = d;
            }
        });
    });

    describe("SnakeCamera", () => {
        it("should follow the snake", () => {
            const rand = new Rand("follow seed");

            const snake = new Snake(
                {
                    id: 0,
                    skin: 0,
                    speed: 6.66,
                    offsetCorrection: 0,
                    length: 42.0,
                    width: 1.0,
                    position: { x: 10 * rand.next(), y: 10 * rand.next() },
                    direction: 2 * Math.PI * rand.next(),
                    targetDirection: 2 * Math.PI * rand.next()
                }
            );

            const cam = new SnakeCamera(snake);

            for (let i = 0; i < 100; i++) {
                const t = 2 * rand.next();
                cam.update(t);
                assert.equal(cam.position.x, snake.getPredictedPosition(t).x);
                assert.equal(cam.position.y, snake.getPredictedPosition(t).y);
            }
        });
    });
});
