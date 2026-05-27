import * as THREE from 'three';

export class PingPong {
  constructor(resolution) {
    const options = {
      type: THREE.HalfFloatType, //To test also with FloatType
      minFilter: THREE.NearestFilter, //disable interpolation beetween pixels
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      depthBuffer: false, //we don't need depth calculation
      stencilBuffer: false, //we don't need stencil calculation
      generateMipmaps: false 
    };
    
    this.targetA = new THREE.WebGLRenderTarget(resolution, resolution, options);

    this.targetB = new THREE.WebGLRenderTarget(resolution, resolution, options);

    this.readBuffer = this.targetA;
    this.writeBuffer = this.targetB;
  }

  swap() {
    const temp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = temp;
  }

  get readTexture() {
    return this.readBuffer.texture;
  }

  get writeTarget() {
    return this.writeBuffer;
  }
}