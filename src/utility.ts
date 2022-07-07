/**
 * Resizes a canvas while preserving canvas content
 * 
 * This is accomplished by copying the canvas to an off-screen buffer,
 * changing width/height, then copying the buffer back.
 * The old content is rendered at the top left.
 * @param canvas
 * @param newWidth
 * @param newHeight 
 */
export function resizeCanvas(canvas: HTMLCanvasElement, newWidth: number, newHeight: number): void {
    // Create temporary canvas to store pixel data
    let buff = document.createElement('canvas');
    buff.width = canvas.width;
    buff.height = canvas.height;
    // Copy pixel data
    let buffCtx = buff.getContext("2d");
    buffCtx.drawImage(canvas, 0, 0);
    // Resize canvas and copy back pixel data
    canvas.width = newWidth;
    canvas.height = newHeight;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(buff, 0, 0);
}

/**
 * Standard Normal variate using Box-Muller transform.
 */
export function randn() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Random uniform integer in range
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 */
export function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}