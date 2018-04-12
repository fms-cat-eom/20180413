#define PARTICLE_LIFE_LENGTH 1.0

#define HUGE 9E16
#define PI 3.14159265
#define V vec3(0.,1.,-1.)
#define saturate(i) clamp(i,0.,1.)
#define lofi(i,m) (floor((i)/(m))*(m))
#define lofir(i,m) (floor((i)/(m)+.5)*(m))

// ------

precision highp float;

uniform float time;
uniform float progress;
uniform float automatonLength;
uniform float particlesSqrt;
uniform float particlePixels;
uniform float totalFrame;
uniform float charShuffle;
uniform bool init;
uniform float deltaTime;
uniform vec2 resolution;
uniform vec3 cameraPos;

uniform sampler2D samplerPcompute;
uniform sampler2D samplerRandom;

// ------

vec2 vInvert( vec2 _uv ) {
  return vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * _uv;
}

// ------

mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

float fractSin( float i ) {
  return fract( sin( i ) * 1846.42 );
}

vec4 random( vec2 _uv ) {
  return texture2D( samplerRandom, _uv );
}

#pragma glslify: noise = require( ./noise )
#pragma glslify: prng = require( ./prng )

vec3 randomSphere( inout vec4 seed ) {
  vec3 v;
  for ( int i = 0; i < 10; i ++ ) {
    v = vec3(
      prng( seed ),
      prng( seed ),
      prng( seed )
    ) * 2.0 - 1.0;
    if ( length( v ) < 1.0 ) { break; }
  }
  return v;
}

vec2 randomCircle( inout vec4 seed ) {
  vec2 v;
  for ( int i = 0; i < 10; i ++ ) {
    v = vec2(
      prng( seed ),
      prng( seed )
    ) * 2.0 - 1.0;
    if ( length( v ) < 1.0 ) { break; }
  }
  return v;
}

vec3 randomBox( inout vec4 seed ) {
  vec3 v;
  v = vec3(
    prng( seed ),
    prng( seed ),
    prng( seed )
  ) * 2.0 - 1.0;
  return v;
}

float uneune( float i, float p ) {
  return sin( 2.0 * PI * (
    fractSin( i ) + floor( 1.0 + 4.0 * fractSin( i + 54.12 ) ) * p
  ) );
}

vec3 uneune3( float i, float p ) {
  return vec3( uneune( i, p ), uneune( i + 11.87, p ), uneune( i + 21.92, p ) );
}

// ------

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 puv = vec2( ( floor( gl_FragCoord.x / particlePixels ) * particlePixels + 0.5 ) / resolution.x, uv.y );
  float number = ( ( gl_FragCoord.x - 0.5 ) / particlePixels ) + ( ( gl_FragCoord.y - 0.5 ) * particlesSqrt );
  float mode = mod( gl_FragCoord.x, particlePixels );
  vec2 dpix = vec2( 1.0 ) / resolution;

  vec4 seed = texture2D( samplerRandom, puv );
  prng( seed );

  vec4 pos = texture2D( samplerPcompute, puv );
  vec4 vel = texture2D( samplerPcompute, puv + dpix * vec2( 1.0, 0.0 ) );

  float dt = deltaTime;

  float timing = mix( 0.0, PARTICLE_LIFE_LENGTH, number / particlesSqrt / particlesSqrt );
  timing += lofi( time, PARTICLE_LIFE_LENGTH );

  if ( time - deltaTime + PARTICLE_LIFE_LENGTH < timing ) {
    timing -= PARTICLE_LIFE_LENGTH;
  }

  if ( time - deltaTime < timing && timing <= time ) {
    dt = time - timing;

    if ( prng( seed ) < 0.03 ) {
      pos.xyz = 10.0 * randomSphere( seed );
      vel.xyz = vec3( 2.0, -3.0, 1.0 );
      vel.w = prng( seed ); // size
    } else {
      float phase = prng( seed );
      float tPhase = lofi( time + dt, 0.02 ) / automatonLength;
      float tMagic = 724.11;
      vec3 p0 = uneune3( tMagic +   0.0, tPhase );
      vec3 p1 = uneune3( tMagic + 100.0, tPhase );
      vec3 p2 = uneune3( tMagic + 200.0, tPhase );
      pos.xyz = 3.0 * mix( p0, mix( p1, mix( p2, p0, saturate( phase * 3.0 - 2.0 ) ), saturate( phase * 3.0 - 1.0 ) ), saturate( phase * 3.0 ) );
      // pos.x = prng( seed ) < 0.5 ? pos.x : -pos.x;
      vel.xyz = vec3( 0.0 );
      vel.w = 1.0; // size
    }

    pos.w = 1.0; // life
  }

  vel.xyz += 20.0 * dt * vec3(
    noise( vec4( pos.xyz * 0.37 + 61.51 + 0.1 * sin( 2.0 * PI * time ), 20.04 ) ),
    noise( vec4( pos.xyz * 0.37 + 15.31 + 0.1 * sin( 2.0 * PI * time ), 41.21 ) ),
    noise( vec4( pos.xyz * 0.37 + 28.79 + 0.1 * sin( 2.0 * PI * time ), 32.95 ) )
  );
  vel.xyz += dt * vec3( 2.0, -3.0, -1.0 );

  pos.xyz += vel.xyz * dt;
  pos.w -= dt / PARTICLE_LIFE_LENGTH;

  gl_FragColor = (
    mode < 1.0 ? pos :
    vel
  );
}