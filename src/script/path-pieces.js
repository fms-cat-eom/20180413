import MathCat from './libs/mathcat';
import xorshift from './libs/xorshift';
const glslify = require( 'glslify' );

xorshift( 487723 );

// ------

let particlePixels = 2;
let particlesSqrt = 256;
let particles = particlesSqrt * particlesSqrt;
// let vertsPerParticle = lunaLen / 3;

// ------

let pathPieces = ( glCatPath, automaton ) => {
  let glCat = glCatPath.glCat;
  let gl = glCat.gl;

  // ------

  let vboQuad = glCat.createVertexbuffer( [ -1, -1, 1, -1, -1, 1, 1, 1 ] );

  let vboParticleUV = glCat.createVertexbuffer( ( () => {
    let ret = [];
    for ( let i = 0; i < particles; i ++ ) {
      let ix = i % particlesSqrt;
      let iy = Math.floor( i / particlesSqrt );
      
      ret.push( ix * particlePixels );
      ret.push( iy );
    }
    return ret;
  } )() );

  // ------

  let textureRandomSize = 32;
  let textureRandomUpdate = ( _tex ) => {
    glCat.setTextureFromArray( _tex, textureRandomSize, textureRandomSize, ( () => {
      let len = textureRandomSize * textureRandomSize * 4;
      let ret = new Uint8Array( len );
      for ( let i = 0; i < len; i ++ ) {
        ret[ i ] = Math.floor( xorshift() * 256.0 );
      }
      return ret;
    } )() );
  };
  
  let textureRandomStatic = glCat.createTexture();
  glCat.textureWrap( textureRandomStatic, gl.REPEAT );
  textureRandomUpdate( textureRandomStatic );
  
  let textureRandom = glCat.createTexture();
  glCat.textureWrap( textureRandom, gl.REPEAT );

  // ------

  glCatPath.add( {
    piecesComputeReturn: {
      width: particlesSqrt * particlePixels,
      height: particlesSqrt,
      vert: glslify( './shader/quad.vert' ),
      frag: glslify( './shader/return.frag' ),
      blend: [ gl.ONE, gl.ZERO ],
      clear: [ 0.0, 0.0, 0.0, 0.0 ],
      framebuffer: true,
      float: true,
      func: ( path, params ) => {
        glCat.attribute( 'p', vboQuad, 2 );
        glCat.uniformTexture( 'sampler0', glCatPath.fb( "piecesCompute" ).texture, 0 );
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      }
    },
  
    piecesCompute: {
      width: particlesSqrt * particlePixels,
      height: particlesSqrt,
      vert: glslify( './shader/quad.vert' ),
      frag: glslify( './shader/pieces-compute.frag' ),
      blend: [ gl.ONE, gl.ZERO ],
      clear: [ 0.0, 0.0, 0.0, 0.0 ],
      framebuffer: true,
      float: true,
      func: ( path, params ) => {
        if ( automaton.time === 0 ) {
          xorshift( 487723 );
        }
        textureRandomUpdate( textureRandom );

        glCat.attribute( 'p', vboQuad, 2 );

        glCat.uniform1f( 'particlesSqrt', particlesSqrt );
        glCat.uniform1f( 'particlePixels', particlePixels );

        glCat.uniformTexture( 'samplerPcompute', glCatPath.fb( "piecesComputeReturn" ).texture, 0 );
        glCat.uniformTexture( 'samplerRandom', textureRandom, 1 );

        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      }
    },
    
    piecesRender: {
      vert: glslify( './shader/pieces-render.vert' ),
      frag: glslify( './shader/pieces-render.frag' ),
      blend: [ gl.SRC_ALPHA, gl.ONE ],
      func: ( path, params ) => {
        glCat.attribute( 'computeUV', vboParticleUV, 2 );
  
        glCat.uniform1f( 'particlesSqrt', particlesSqrt );
        glCat.uniform1f( 'particlePixels', particlePixels );

        glCat.uniform2fv( 'resolutionPcompute', [ particlesSqrt * particlePixels, particlesSqrt ] );
        glCat.uniformTexture( 'samplerPcompute', glCatPath.fb( "piecesCompute" ).texture, 1 );
 
        glCat.uniform3fv( 'color', [ 0.1, 2.0, 1.0 ] );
        gl.drawArrays( gl.POINTS, 0, particles );
      }
    },
  } );
};

module.exports = pathPieces;