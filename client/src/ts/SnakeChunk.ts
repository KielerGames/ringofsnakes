import { decode } from "./ChainCodeDecoder";

export default class SnakeChunk {
    private points:{x:number, y:number}[] = [];
    
    public constructor(buffer: ArrayBuffer) {
        //const view = new DataView(buffer);
        const data = new Uint8Array(buffer);
        console.assert(data.length === 64);
        
        let x = 0, y=0, alpha=0;
        this.points.push({x,y});

        for(let i=0; i<data.length; i++) {
            const decoded = decode(data[i]);
            alpha += decoded.dirDelta;
            if(Math.abs(alpha) > Math.PI) {
                alpha += (alpha < 0 ? 2 : -2) * Math.PI;
            }
            x += Math.cos(alpha);
            y += Math.sin(alpha);
            this.points.push({x,y});
        }
    }
}
