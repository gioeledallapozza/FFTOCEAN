import * as THREE from 'three';

export default class PingPong {
  constructor(resolution) {
    const options = {
      type: THREE.HalfFloatType, //To test also with FloatType
      minFilter: THREE.LinearFilter, //disable interpolation beetween pixels
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      depthBuffer: false, //we don't need depth calculation
      stencilBuffer: false, //we don't need stencil calculation
      generateMipmaps: false,
      count: 3, //MRT activation for 3 textures (Y,X,Z) in the same shader pass
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping
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