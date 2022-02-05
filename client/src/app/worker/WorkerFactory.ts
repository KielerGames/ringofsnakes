import * as Comlink from "comlink";
import { WorkerAPI } from "./worker";

// can be mocked in tests

export default function createRemote(): Comlink.Remote<WorkerAPI> {
    return Comlink.wrap<WorkerAPI>(new Worker("worker.bundle.js", { name: "SnakeWorker" }));
}
