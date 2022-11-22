#version 300 es
  
uniform vec2 uTranslate;
in vec4 aPosition;

void
main()
{
    gl_Position = aPosition + vec4(uTranslate, 0, 0);
}