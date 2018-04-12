#define TAU 6.283185307

precision highp float;

uniform float progress;
uniform vec2 resolution;
uniform sampler2D sampler0;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;

  if (
    16.0 < gl_FragCoord.x && gl_FragCoord.x < 28.0 &&
    18.0 < gl_FragCoord.y && gl_FragCoord.y < 70.0
  ) {
    gl_FragColor = vec4(
      1.0, 1.0, 1.0,
      smoothstep( -0.9, 0.0, sin(
        8.0 * TAU * progress
        + 0.6 * ( gl_FragCoord.x + gl_FragCoord.y )
      ) )
    );
  } else {
    gl_FragColor = texture2D( sampler0, vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * uv );
  }
}
