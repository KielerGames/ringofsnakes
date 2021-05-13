const n = 3;

/**
 * A 3x3 matrix (stored in column-major order) intended for use with WebGL
 */
export default class Matrix {
    public data: Float32Array;

    public constructor(initialize = true) {
        // initialized with 0s
        this.data = new Float32Array(n * n);

        if (initialize) {
            // initialize as identity
            for (let i = 0; i < n; i++) {
                this.data[(n+1) * i] = 1.0;
            }
        }
    }

    public setEntry(row: number, column: number, value: number): void {
        this.data[row + n * column] = value;
    }

    // public multiply3(v:Vector, res = new Vector()):Vector {
    //     for(let i=0; i<3; i++) {
    //         let sum = 0.0;
    //         for(let j=0; j<3; j++) {
    //             sum += v.data[j] * this.data[i + 4*j];
    //         }
    //         res.data[i] = sum + this.data[i + 4*3];
    //     }

    //     return res;
    // }

    // public getColumn(col:number):Vector {
    //     let idx = 4*col;
    //     return new Vector(this.data.subarray(idx, idx+4));
    // }

    /**
     * Multiply two matrices.
     * @param a the left matrix
     * @param b the right matrix
     * @param res the result matrix (a new matrix if omitted)
     * @returns the matrix product
     */
    public static compose(
        a: Matrix,
        b: Matrix,
        res: Matrix = new Matrix()
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
                res.data[i + n * j] = sum;
            }
        }

        return res;
    }
}
