import Rectangle from "../../src/app/math/Rectangle";
import Rand from "rand-seed";
import Vector from "../../src/app/math/Vector";

describe("Rectangle", () => {
    it("should be a square", () => {
        const rand = new Rand("square rect seed");
        const size = Math.floor(1 + 10 * rand.next());
        const rect = new Rectangle(0, size, 0, size);
        expect(rect.width).toBe(size);
        expect(rect.width).toBe(rect.height);
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

        expect(rect1.minX).toBe(rect2.minX);
        expect(rect1.minY).toBe(rect2.minY);
        expect(rect1.maxX).toBe(rect2.maxX);
        expect(rect1.maxY).toBe(rect2.maxY);
    });

    test("disjoint rectangles", () => {
        const rand = new Rand("disjoint rect seed");

        const rect1 = createRandomRectangle(100, rand);

        const rect2Width = 100 * rand.next();

        const rect2 = new Rectangle(
            rect1.maxX + 20,
            rect1.maxX + 20 + rect2Width,
            0,
            100 * rand.next() + 1
        );

        expect(Rectangle.distance2(rect1, rect2)).toBeGreaterThan(0.0);
    });

    test("partially intersecting rectangles", () => {
        const rect1 = new Rectangle(0, 10, 0, 10);
        const rect2 = new Rectangle(5, 15, 0, 10);

        expect(Rectangle.distance2(rect1, rect2)).toBe(0.0);
    });

    test("distance properties", () => {
        const rand = new Rand("distance test seed");

        for (let i = 0; i < 100; i++) {
            const rect1 = createRandomRectangle(100, rand);
            const rect2 = createRandomRectangle(100, rand);

            const dist1 = Rectangle.distance2(rect1, rect2);
            const dist2 = Rectangle.distance2(rect1, rect2);

            expect(dist1).toBeGreaterThanOrEqual(0.0);
            expect(dist2).toBeGreaterThanOrEqual(0.0);

            expect(dist1).toBeCloseTo(dist2, 8);
        }
    });

    test("extension should contain point", () => {
        const rect = new Rectangle(1, 2, 0, 1);
        const point = new Vector(0.5, 0.5);

        expect(rect.contains(point)).toBe(false);

        const extendedRect = rect.extendTo(point);
        expect(extendedRect.contains(point)).toBe(true);
        expect(Rectangle.distance2(rect, extendedRect)).toBe(0.0);
    });

    it("should not shrink", () => {
        const rand = new Rand("rectangle grow seed");

        let rect = new Rectangle(0, 0, 0, 0);

        for (let i = 0; i < 100; i++) {
            const point = new Vector(
                200 * rand.next() - 100,
                200 * rand.next() - 100
            );
            const extendedRect = rect.extendTo(point);
            expect(extendedRect.width).toBeGreaterThanOrEqual(rect.width);
            expect(extendedRect.height).toBeGreaterThanOrEqual(rect.height);

            rect = extendedRect;
        }
    });
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
