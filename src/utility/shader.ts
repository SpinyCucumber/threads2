export function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source.replace(/^\s+|\s+$/g, ''));
    gl.compileShader(shader);
    return shader;
}

export function createProgram(gl: WebGL2RenderingContext, ...shaders: WebGLShader[]): WebGLProgram {
    const program = gl.createProgram();
    for (const shader of shaders) gl.attachShader(program, shader);
    gl.linkProgram(program);
    return program;
}