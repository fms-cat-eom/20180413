#define PI 3.14159265
#define TAU 6.28318531
#define saturate(i) clamp(i,0.,1.)

// ------

precision highp float;

varying float vLife;
varying float vSize;
varying vec3 vNor;

uniform vec3 color;
uniform vec3 cameraPos;
uniform float cameraNear;
uniform float cameraFar;
uniform vec3 lightPos;

// ------

vec3 catColor( float _p ) {
  return 0.5 + 0.5 * vec3(
    cos( _p ),
    cos( _p + PI / 3.0 * 2.0 ),
    cos( _p + PI / 3.0 * 4.0 )
  );
}

mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

// ------

void main() {
  float curve = exp( -20.0 * ( 1.0 - vLife ) );
  float curve2 = exp( -2.0 * ( 1.0 - vLife ) );
  
  float dif = 1.0 + 3.0 * curve;
  vec3 col = 0.1 + 0.9 * catColor( 3.5 - 1.7 * ( 1.0 - curve2 ) );

  float shape = smoothstep( 0.5, 0.4, length( gl_PointCoord - 0.5 ) );

  gl_FragColor = vec4( 2.0 * dif * col, shape );
}