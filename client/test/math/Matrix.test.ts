import Matrix from "../../src/app/math/Matrix";
import Vector from "../../src/app/math/Vector";
import Rand from "rand-seed";

describe("Matrix", () => {
    test("identity matrix", () => {
        const matrix = new Matrix(true);
        expect(matrix.getEntry(0, 0)).toBe(1);
        expect(matrix.getEntry(1, 1)).toBe(1);

        const v1 = new Vector(42.0, 13.7);
        const v2 = matrix.multiply(v1);
        expect(Vector.equals(v1, v2, 1e-8)).toBe(true);
    });

    test("zero matrix", () => {
        const matrix = new Matrix(false);
        expect(matrix.getEntry(0, 0)).toBe(0);
        expect(matrix.getEntry(1, 1)).toBe(0);

        const v = new Vector(42.0, 13.7);
        const zero = new Vector(0.0, 0.0);
        expect(Vector.equals(matrix.multiply(v), zero, 1e-8)).toBe(true);
    });

    test("determinant", () => {
        const identity = new Matrix(true);
        const zero = new Matrix(false);
        const two = new Matrix(true);
        two.setEntry(0, 0, 2.0);

        expect(identity.det()).toBe(1.0);
        expect(zero.det()).toBe(0.0);
        expect(two.det()).toBe(2.0);
    });

    test("identity inverse", () => {
        const identity = new Matrix(true);
        const inv = Matrix.inverse(identity);

        for (let i = 0; i < inv.data.length; i++) {
            expect(inv.data[i]).toBe(identity.data[i]);
        }
    });

    test("non-trivial inverse", () => {
        const m = new Matrix(true);
        m.setEntry(0, 1, 2.0);
        m.setEntry(1, 0, 3.0);
        m.setEntry(1, 1, 4.0);
        m.setEntry(0, 2, 5.0);
        m.setEntry(1, 2, 6.0);

        const inv = Matrix.inverse(m);
        const rand = new Rand("non-trivial inverse seed");

        for (let i = 0; i < 13; i++) {
            const v1 = new Vector(rand.next(), rand.next());
            const v2 = m.multiply(v1);
            const v3 = inv.multiply(v2);
            expect(Vector.equals(v1, v3, 1e-8)).toBe(true);
        }
    });
});
