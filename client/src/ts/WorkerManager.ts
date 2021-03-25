import { MessageFromMain, MessageFromWorker, RequestFrameData } from "./protocol/main-worker";
import assert from "./utilities/assert";

type ResponseHandler = (data: any) => void;

export default class WorkerManager {
    private readonly worker:Worker;
    private requestId: number = 0;
    private requests:Map<number, ResponseHandler> = new Map();

    public constructor() {
        this.worker = new Worker("worker.bundle.js", { name: "SnakeWorker" });
    }

    private onMessage(event: MessageEvent) {
        const message = event.data as MessageFromWorker;

        switch(message.tag) {
            case "FrameDataResponse": {
                const responseHandler = this.requests.get(message.id);
                if(responseHandler === undefined) {
                    throw new Error(`Unexpected frame data response (id=${message.id})`);
                }
                this.requests.delete(message.id);
                responseHandler(message.data);
            }
                
        }
    }

    public postMessage(message: MessageFromMain): void {
        this.worker.postMessage(message);
    }

    public async requestFrameData(time: number):Promise<any> {
        const reqId = this.requestId++;
        const request:RequestFrameData = {
            tag: "RequestFrameData",
            id: reqId,
            time
        };
        this.postMessage(request);
        return await new Promise(resolve => {
            this.requests.set(reqId, resolve);
        });
    }
}
