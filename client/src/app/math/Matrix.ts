import Vector, { VectorLike } from "./Vector";

const n = 3;

/**
 * A 3x3 matrix (stored in column-major order) intended for use with WebGL
 */
export default class Matrix {
    data: Float32Array;

    /**
     * Create a new identity or zero matrix.
     */
    constructor(identity: boolean) {
        // initialized with 0s
        this.data = new Float32Array(n * n);

        if (identity) {
            // initialize as identity
            for (let i = 0; i < n; i++) {
                this.data[(n + 1) * i] = 1.0;
            }
        }
    }

    setEntry(row: number, column: number, value: number): void {
        this.data[row + n * column] = value;
    }

    getEntry(row: number, column: number): number {
        return this.data[row + n * column];
    }

    multiply(v: Readonly<VectorLike>, result = new Vector(0, 0)): Vector {
        const d = this.data;
        result.x = d[0] * v.x + d[n] * v.y + d[n + n];
        result.y = d[1] * v.x + d[1 + n] * v.y + d[1 + n + n];
        return result;
    }

    /**
     * Compute the determinant of this matrix.
     */
    det(): number {
        const m = this.data;
        return (
            m[3] * m[7] * m[2] +
            m[6] * m[1] * m[5] +
            m[0] * m[4] * m[8] -
            m[6] * m[4] * m[2] -
            m[0] * m[7] * m[5] -
            m[3] * m[1] * m[8]
        );
    }

    /**
     * Multiply two matrices.
     * @param a the left matrix
     * @param b the right matrix
     * @param result the result matrix (a new matrix if omitted)
     * @returns the matrix product
     */
    static compose(
        a: ReadonlyMatrix,
        b: ReadonlyMatrix,
        result: Matrix = new Matrix(false)
    ): Matrix {
        // result row i
        for (let i = 0; i < n; i++) {
            // result column j
            for (let j = 0; j < n; j++) {
                // compute dot product of row i of A
                // and column j of B
                let sum = 0.0;
                for (let k = 0; k < n; k++) {
                    sum += a.data[i + n * k] * b.data[k + n * j];
                }
                result.data[i + n * j] = sum;
            }
        }

        return result;
    }

    static inverse(a: ReadonlyMatrix, result: Matrix = new Matrix(false)): Matrix {
        const det = a.det();

        if (det === 0.0) {
            throw new Error("Matrix cannot be inverted.");
        }

        const s = 1.0 / det;
        
        const ad = a.data, rd = result.data;
        rd[0] = s * (ad[4] * ad[8] - ad[7] * ad[5]);
        rd[1] = s * (ad[7] * ad[2] - ad[1] * ad[8]);
        rd[2] = s * (ad[1] * ad[5] - ad[4] * ad[2]);

        rd[3] = s * (ad[6] * ad[5] - ad[3] * ad[8]);
        rd[4] = s * (ad[0] * ad[8] - ad[6] * ad[2]);
        rd[5] = s * (ad[3] * ad[2] - ad[0] * ad[5]);

        rd[6] = s * (ad[3] * ad[7] - ad[6] * ad[4]);
        rd[7] = s * (ad[6] * ad[1] - ad[0] * ad[7]);
        rd[8] = s * (ad[0] * ad[4] - ad[3] * ad[1]);

        return result;
    }
}

export type ReadonlyMatrix = Omit<Readonly<Matrix>, "setEntry">;
