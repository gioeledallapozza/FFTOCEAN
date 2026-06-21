import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

import vertexShader from './shaders/seafloor/seafloorVertex.glsl'
import fragmentShader from './shaders/seafloor/seafloorFragment.glsl'

const SeaFloorMaterial = shaderMaterial(
    {
        uTime: 0,
        uSandColor: new THREE.Color('#d2b48c'),
        uWaterDeepColor: new THREE.Color('#002b4f'),
        uMaxDepth: 60.0,
        uTextureScale: 100.0,
        uSandTexture: null
    },
    vertexShader,
    fragmentShader
);

extend({ SeaFloorMaterial })

export { SeaFloorMaterial }