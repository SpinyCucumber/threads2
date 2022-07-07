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