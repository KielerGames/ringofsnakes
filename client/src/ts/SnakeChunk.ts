import { decode } from "./worker/ChainCodeDecoder";

export default class SnakeChunk {
    private points: { x: number; y: number }[] = [];

    public constructor(buffer: ArrayBuffer) {
        //const view = new DataView(buffer);
        const data = new Uint8Array(buffer);
        console.assert(data.length === 64);

        let x = 0,
            y = 0,
            alpha = 0;
        this.points.push({ x, y });

        for (let i = 0; i < data.length; i++) {
            if(i > 0 && data[i] == 0 && data[i-1] == 0) {
                break;
            }
            const decoded = decode(data[i]);
            alpha += decoded.dirDelta;
            if (Math.abs(alpha) > Math.PI) {
                alpha += (alpha < 0 ? 2 : -2) * Math.PI;
            }
            x += ccStepSize * Math.cos(alpha);
            y += ccStepSize * Math.sin(alpha);
            this.points.push({ x, y });
        }
    }

    public draw(ctx: CanvasRenderingContext2D, startX:number, startY:number): void {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        this.points.forEach(p => ctx.lineTo(startX + p.x, startY - p.y));
        ctx.lineWidth = 4;
        ctx.stroke(); 
    }
}

const ccStepSize = 5.0;