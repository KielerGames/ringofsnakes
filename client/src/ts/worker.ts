import * as SCD from "./SnakeChunkData";

const ctx: Worker = self as any;

// Post data to parent thread
ctx.postMessage({ foo: "foo" });

// Respond to message from parent thread
ctx.addEventListener("message", (event) =>
    console.log("message from main: ", event.data)
);

function test(bufferFromServer: ArrayBuffer): void {
    const data = SCD.decode(bufferFromServer);
    // transfer data to main thread (including ownership of data.glVertexBuffer)
    ctx.postMessage({ tag: "SnakeChunkData", data: data }, [
        data.glVertexBuffer,
    ]);
}
