/**
 * Set the canvas width & height to its client width & height (the size set by styles).
 * Does not resize the canvas if it has the target resolution.
 * @param gl the associated WebGL rendering context
 */
export function updateCanvasSize(gl: WebGL2RenderingContext) {
    const canvas = gl.canvas as HTMLCanvasElement;

    // get current canvas size in CSS pixels
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        if (__DEBUG__) {
            console.info("Resizing canvas...");
        }

        // resize canvas
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        // update clip space to screen pixel transformation
        gl.viewport(0, 0, displayWidth, displayHeight);
    }
}
