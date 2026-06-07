import * as THREE from 'three';

export default class PingPong {
  constructor(resolution) {
    const options = {
      type: THREE.FloatType, //To test also with FloatType
      minFilter: THREE.NearestFilter, //disable interpolation beetween pixels
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      depthBuffer: false, //we don't need depth calculation
      stencilBuffer: false, //we don't need stencil calculation
      generateMipmaps: false,
      count: 3 //MRT activation for 3 textures (Y,X,Z) in the same shader pass
    };
    
    //WebGL2
    this.targetA = new THREE.WebGLRenderTarget(resolution, resolution, options);
    this.targetB = new THREE.WebGLRenderTarget(resolution, resolution, options);

    this.readTarget = this.targetA;
    this.writeTarget = this.targetB;
  }

  swap() {
    const temp = this.readTarget;
    this.readTarget = this.writeTarget;
    this.writeTarget = temp;
  }
}