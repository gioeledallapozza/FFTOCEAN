import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import oceanVertexShader from './shaders/oceanVertex.glsl'
import oceanFragmentShader from './shaders/oceanFragment.glsl'

const OceanMaterial = shaderMaterial(
  { uTime: 0 }, //Uniforms
  oceanVertexShader,
  oceanFragmentShader
)

extend({ OceanMaterial })