import { assert } from "chai";
import Rand from "rand-seed";
import Camera from "../app/data/Camera";
import Vector from "../app/math/Vector";

function createRandomPoint(rand: Rand, maxValue: number): Vector {
    const x = (2 * rand.next() - 1) * maxValue;
    const y = (2 * rand.next() - 1) * maxValue;
    return new Vector(x, y);
}

describe("Camera", () => {
    it("should not move", () => {
        const rand = new Rand("stationary seed");
        const cam = Camera.createAt(createRandomPoint(rand, 42.0));
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
        const cam = Camera.createAt(createRandomPoint(rand, 42.0), 2.71828);
        const target = createRandomPoint(rand, 100);

        let distance = Vector.distance(cam.position, target);
        cam.setTargetPosition(target);

        for(let i=0; i<42; i++) {
            cam.update(1/60);
            const d = Vector.distance(cam.position, target);
            assert.isBelow(d, distance);
            distance = d;
        }
    });
});
