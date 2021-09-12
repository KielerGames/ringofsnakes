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

        const rect1 = createRandomRectangle(100, rand);

        const rect2Width = 100 * rand.next();

        const rect2 = new Rectangle(
            rect1.maxX + 20,
            rect1.maxX + 20 + rect2Width,
            0,
            100 * rand.next() + 1
        );

        assert.isAbove(Rectangle.distance2(rect1, rect2), 0.0);
    });

    it("partially intersecting rectangles", () => {
        const rect1 = new Rectangle(0, 10, 0, 10);
        const rect2 = new Rectangle(5, 15, 0, 10);

        assert.equal(Rectangle.distance2(rect1, rect2), 0.0);
    });

    it("distance properties", () => {
        const rand = new Rand("distance test seed");

        for(let i=0; i<100; i++) {
            const rect1 = createRandomRectangle(100, rand);
            const rect2 = createRandomRectangle(100, rand);

            const dist1 = Rectangle.distance2(rect1, rect2);
            const dist2 = Rectangle.distance2(rect1, rect2);

            assert.isAtLeast(dist1, 0.0);
            assert.isAtLeast(dist2, 0.0);

            assert.approximately(dist1, dist2, 1e-8);
        }
    });

    function createRandomRectangle(scale: number, rand: Rand): Rectangle {
        const x = scale * rand.next();
        const y = scale * rand.next();
        return new Rectangle(
            x,
            x + scale * rand.next(),
            y,
            y + scale * rand.next()
        );
    }
});
