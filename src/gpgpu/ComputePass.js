import * as THREE from 'three';

export default class ComputePass {
  constructor(material) {

    //Inizializzazione camera, con lo spazio CLIP di WebGL
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.scene = new THREE.Scene();
    
    this.geometry = new THREE.PlaneGeometry(2, 2); //The sizes fills the entire clip space

    this.material = material;
    
    //Crea la mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setMaterial(material) {
    this.mesh.material = material;
    this.material = material;
  }

  // Main Engine
  render(gl, target = null) {
    gl.setRenderTarget(target);

    gl.render(this.scene, this.camera);
  }
}