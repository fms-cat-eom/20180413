#define PI 3.141592654

precision highp float;

uniform float rot;
uniform vec2 resolution;

uniform sampler2D sampler0;

bool isValidUV( vec2 v ) { return 0.0 < v.x && v.x < 1.0 && 0.0 < v.y && v.y < 1.0; }

mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

vec2 mirrorCircle( vec2 _p, vec2 _o, float _r ) {
  vec2 vc = _p - _o;
  vec2 ve = normalize( vc ) * ( _r - length( vc ) );
  return _p + ve * 2.0;
}

vec3 catColor( float _p ) {
  return 0.5 + 0.5 * vec3(
    cos( _p ),
    cos( _p + PI / 3.0 * 2.0 ),
    cos( _p + PI / 3.0 * 4.0 )
  );
}

void main() {
  vec2 p = ( gl_FragCoord.xy * 2.0 - resolution ) / resolution.y;

  vec2 pm = p;

  float r = 1.0;

  float recur = 0.0;
  for ( int i = 0; i < 20; i ++ ) {
    vec2 nc = sign( pm ) * 1.0;
    if ( length( nc - pm ) < r ) {
      pm = mirrorCircle( pm, nc, r );
      recur += 1.0;
    } else {
      break;
    }
  }

  pm.x = abs( pm.x );
  // pm.y = abs( pm.y );

  vec2 uv = ( pm * resolution.y + resolution ) / 2.0 / resolution;
  if ( recur == 20.0 || !isValidUV( uv ) ) {
    gl_FragColor = vec4( 0.0 );
  } else {
    gl_FragColor = texture2D( sampler0, uv ) * mix(
      vec4( catColor( recur ), 1.0 ),
      vec4( 1.0 ),
      exp( -recur )
    );
  }
  // gl_FragColor = vec4( uv, 0.0, 1.0 );
}