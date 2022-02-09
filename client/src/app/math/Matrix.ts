import Vector, { VectorLike } from "./Vector";

const n = 3;

/**
 * A 3x3 matrix (stored in column-major order) intended for use with WebGL
 */
export default class Matrix {
    public data: Float32Array;

    /**
     * Create a new identity or zero matrix.
     */
    public constructor(identity: boolean) {
        // initialized with 0s
        this.data = new Float32Array(n * n);

        if (identity) {
            // initialize as identity
            for (let i = 0; i < n; i++) {
                this.data[(n + 1) * i] = 1.0;
            }
        }
    }

    public setEntry(row: number, column: number, value: number): void {
        this.data[row + n * column] = value;
    }

    public getEntry(row: number, column: number): number {
        return this.data[row + n * column];
    }

    public multiply(v: Readonly<VectorLike>, result = new Vector(0, 0)): Vector {
        const d = this.data;
        result.x = d[0] * v.x + d[n] * v.y + d[n + n];
        result.y = d[1] * v.x + d[1 + n] * v.y + d[1 + n + n];
        return result;
    }

    // public getColumn(col:number):Vector {
    //     let idx = 4*col;
    //     return new Vector(this.data.subarray(idx, idx+4));
    // }

    /**
     * Multiply two matrices.
     * @param a the left matrix
     * @param b the right matrix
     * @param result the result matrix (a new matrix if omitted)
     * @returns the matrix product
     */
    public static compose(a: Readonly<Matrix>, b: Readonly<Matrix>, result?: Matrix): Matrix {
        if (result === undefined) {
            result = new Matrix(false);
        }

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
}
