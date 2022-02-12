import Matrix from "../../src/app/math/Matrix";
import Vector from "../../src/app/math/Vector";

describe("Matrix", () => {
    test("identity matrix", () => {
        const matrix = new Matrix(true);
        expect(matrix.getEntry(0, 0)).toBe(1);
        expect(matrix.getEntry(1, 1)).toBe(1);

        const v1 = new Vector(42.0, 13.7);
        const v2 = matrix.multiply(v1);
        expect(Vector.equals(v1, v2, 1e-8));
    });

    test("identity matrix", () => {
        const matrix = new Matrix(false);
        expect(matrix.getEntry(0, 0)).toBe(0);
        expect(matrix.getEntry(1, 1)).toBe(0);

        const v1 = new Vector(42.0, 13.7);
        const v2 = matrix.multiply(v1);
        expect(Vector.equals(v1, v2, 1e-8));
    });
});
