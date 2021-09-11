import { assert } from "chai";
import Rectangle from "../app/math/Rectangle";
import Rand from "rand-seed";

describe("Rectangle", () => {
    it("should be a square", () => {
        const rand = new Rand("square rect seed");
        const size = Math.floor(1 + 10 * rand.next());
        const rect = new Rectangle(0, size, 0, size);
        assert.equal(rect.width, size);
        assert.equal(rect.width, rect.height);
    });

    it("should be transferable", () => {
        const rand = new Rand("transferable rect seed");
        const rect1 = new Rectangle(
            100 * rand.next(),
            100 * rand.next(),
            100 * rand.next(),
            100 * rand.next()
        );
        const dto = rect1.createTransferable();
        const rect2 = Rectangle.fromTransferable(dto);

        assert.equal(rect1.minX, rect2.minX);
        assert.equal(rect1.minY, rect2.minY);
        assert.equal(rect1.maxX, rect2.maxX);
        assert.equal(rect1.maxY, rect2.maxY);
    });

    it("disjoint rectangles", () => {
        const rand = new Rand("disjoint rect seed");

        const rect1 = new Rectangle(
            100 * rand.next(),
            100 * rand.next(),
            100 * rand.next(),
            100 * rand.next()
        );

        const rect2Width = 100 * rand.next();

        const rect2 = new Rectangle(
            rect1.maxX + 20,
            rect1.maxX + 20 + rect2Width,
            100 * rand.next(),
            100 * rand.next()
        );

        assert.isAbove(Rectangle.distance2(rect1, rect2), 0.0);
    });
});
