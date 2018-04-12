import MathCat from './libs/mathcat';
const glslify = require( 'glslify' );

// ------

module.exports = ( glCatPath, width, height ) => {
  let glCat = glCatPath.glCat;
  let gl = glCat.gl;

  // ------

  let canvas = document.createElement( 'canvas' );
  let context = canvas.getContext( '2d' );

  canvas.width = width;
  canvas.height = height;

  context.fillStyle = '#fff';

  // ------

  let vboQuad = glCat.createVertexbuffer( [ -1, -1, 1, -1, -1, 1, 1, 1 ] );

  let texture = glCat.createTexture();

  // ------

  glCatPath.add( {
    text: {
      width: width,
      height: height,
      blend: [ gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA ],
      vert: glslify( './shader/quad.vert' ),
      frag: glslify( './shader/text.frag' ),
      func: ( path, params ) => {
        context.clearRect( 0, 0, width, height );
  
        context.textAlign = 'left';

        context.font = '200 40px Helvetica Neue';
        context.fillText(
          'Triangle Jellyfish',
          34,
          height - 40
        );
      
        context.font = '200 20px Helvetica Neue';
        context.fillText(
          'Everyday One Motion - 20180413',
          34,
          height - 20
        );

        context.textAlign = 'right';

        context.font = '100 120px Helvetica Neue';
        context.fillText(
          params.frame,
          width - 10,
          90
        );

        context.font = '200 30px Helvetica Neue';
        context.fillText(
          'frames',
          width - 14,
          116
        );

        glCat.setTexture( texture, canvas );

        glCat.attribute( 'p', vboQuad, 2 );
        glCat.uniformTexture( 'sampler0', texture, 0 );
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      }
    },
  } );
};