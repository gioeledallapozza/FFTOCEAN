import * as THREE from 'three';

export class PingPong {
  constructor(resolution) {
    // 1. Definisci le options (HalfFloat, NearestFilter, no depth/stencil)
    
    // 2. Istanzia this.targetA e this.targetB usando THREE.WebGLRenderTarget
    
    // 3. Inizializza this.readBuffer e this.writeBuffer
  }

  swap() {
    // 4. Inverti this.readBuffer e this.writeBuffer
  }

  get readTexture() {
    // 5. Ritorna la .texture del tuo readBuffer attuale
  }

  get writeTarget() {
    // 6. Ritorna l'intero writeBuffer (ti serve per il renderer.setRenderTarget)
  }
}