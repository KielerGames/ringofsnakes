import * as Comlink from "comlink";
import { WorkerAPI } from "./worker";
import * as ResourceLoader from "../ResourceLoader";

// can be mocked in tests

const blobURL = (async () => {
    const blob = await ResourceLoader.PREGAME.loadBlob("worker.bundle.js");
    return URL.createObjectURL(blob);
})();

export default async function createRemote(): Promise<Comlink.Remote<WorkerAPI>> {
    const url = await blobURL;
    return Comlink.wrap<WorkerAPI>(new Worker(url, { name: "SnakeWorker" }));
}
