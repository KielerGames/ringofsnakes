import { MessageFromWorker } from "./main-worker";

export function transferAll(ctx: Worker, msg: MessageFromWorker): void {
    ctx.postMessage(msg, findArrayBuffers(msg));
}

function findArrayBuffers(obj: any): ArrayBuffer[] {
    if (obj instanceof ArrayBuffer) {
        return [obj];
    } else if (typeof obj === "object") {
        return Object.keys(obj).flatMap((key) => findArrayBuffers(obj[key]));
    } else {
        return [];
    }
}
