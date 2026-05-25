import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import oceanVertexShader from './shaders/oceanVertex.glsl'
import oceanFragmentShader from './shaders/oceanFragment.glsl'
import * as THREE from 'three'

const OceanMaterial = shaderMaterial(
  //Uniforms
  { 
    uTime: 0,
    uDisplacementMap: new THREE.Texture()
  }, 
  // Shaders
  oceanVertexShader,
  oceanFragmentShader
);

extend({ OceanMaterial });