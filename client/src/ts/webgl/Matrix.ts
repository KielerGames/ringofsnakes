/**
 * A 4x4 matrix (stored in column-major order) intended for use with WebGL
 */
export default class Matrix {
    public data: Float32Array;

    public constructor(initialize = true) {
        // initialized with 0s
        this.data = new Float32Array(4*4);

        if(initialize) {
            for(let i=0; i<4; i++) {
                this.data[5*i] = 1.0;
            }
        }
    }

    public setEntry(row:number, column:number, value:number):void {
        this.data[row + 4 * column] = value;
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

    public static compose(a:Matrix, b:Matrix, res:Matrix = new Matrix()):Matrix {
        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                let sum = 0.0;
                for(let k=0; k<4; k++) {
                    sum += a.data[i + 4 * k] * b.data[k + 4 * j];
                }
                res.data[i + 4 * j] = sum;
            }
        }

        return res;
    }

    // public static rotation(axis:Vector, angle:number):Matrix {
    //     let c = Math.cos(angle), s = Math.sin(angle);
    //     let R = new Matrix();
    //     let m = R.data, u = axis.data;

    //     m[0]  = c + u[0]*u[0]*(1.0-c);
    //     m[1]  =     u[1]*u[0]*(1.0-c) + u[2]*s;
    //     m[2]  =     u[2]*u[0]*(1.0-c) - u[1]*s;

    //     m[4]  =     u[0]*u[1]*(1.0-c) - u[2]*s;
    //     m[5]  = c + u[1]*u[1]*(1.0-c);
    //     m[6]  =     u[2]*u[1]*(1.0-c) + u[0]*s;

    //     m[8]  =     u[0]*u[2]*(1.0-c) + u[1]*s;
    //     m[9]  =     u[1]*u[2]*(1.0-c) - u[0]*s;
    //     m[10] = c + u[2]*u[2]*(1.0-c);

    //     m[15] = 1.0;

    //     return R;
    // }
}
