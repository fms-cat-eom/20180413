import MathCat from './libs/mathcat';
const glslify = require( 'glslify' );

// ------

let pathPostfx = ( glCatPath, width, height ) => {
  let glCat = glCatPath.glCat;
  let gl = glCat.gl;

  // ------

  let vboQuad = glCat.createVertexbuffer( [ -1, -1, 1, -1, -1, 1, 1, 1 ] );

  // ------

  glCatPath.add( {
    bloom: {
      width: width / 4,
      height: height / 4,
      vert: glslify( './shader/quad.vert' ),
      frag: glslify( './shader/gauss.frag' ),
      blend: [ gl.ONE, gl.ONE ],
      clear: [ 0.0, 0.0, 0.0, 0.0 ],
      framebuffer: true,
      float: true,
      tempFb: glCat.createFramebuffer( width / 4, height / 4 ),
      func: ( path, params ) => {
        glCat.attribute( "p", vboQuad, 2 );

        for ( let i = 0; i < 3; i ++ ) {
          let gaussVar = [ 1.0, 4.0, 10.0 ][ i ];
          glCat.uniform1f( "var", gaussVar );

          gl.bindFramebuffer( gl.FRAMEBUFFER, path.tempFb.framebuffer );
          glCat.clear( ...path.clear );
          glCat.uniform1i( "isVert", false );
          glCat.uniformTexture( "sampler0", params.input, 0 );
          gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
          
          gl.bindFramebuffer( gl.FRAMEBUFFER, params.framebuffer );
          glCat.uniform1i( "isVert", true );
          glCat.uniformTexture( "sampler0", path.tempFb.texture, 0 );
          gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
        }
      }
    },
  
    bloomFinalize: {
      width: width,
      height: height,
      vert: glslify( "./shader/quad.vert" ),
      frag: glslify( "./shader/bloom-finalize.frag" ),
      blend: [ gl.ONE, gl.ZERO ],
      clear: [ 0.0, 0.0, 0.0, 0.0 ],
      framebuffer: true,
      float: true,
      func: ( path, params ) => {
        glCat.attribute( "p", vboQuad, 2 );
        glCat.uniform3fv( "bias", params.bias );
        glCat.uniform3fv( "factor", params.factor );
        glCat.uniformTexture( "samplerDry", params.dry, 0 );
        glCat.uniformTexture( "samplerWet", params.wet, 1 );
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      }
    },

    post: {
      width: width,
      height: height,
      vert: glslify( './shader/quad.vert' ),
      frag: glslify( './shader/post.frag' ),
      blend: [ gl.ONE, gl.ZERO ],
      clear: [ 0.0, 0.0, 0.0, 0.0 ],
      framebuffer: true,
      float: true,
      func: ( path, params ) => {
        glCat.attribute( 'p', vboQuad, 2 );
        glCat.uniformTexture( 'sampler0', params.input, 0 );
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      }
    },
  } );
};

module.exports = pathPostfx;