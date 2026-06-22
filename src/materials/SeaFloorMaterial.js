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
        uWaterShallowColor: new THREE.Color('#rgb(65, 124, 173'),
        uMaxDepth: 60.0,
        uTextureScale: 100.0,
        uSandTexture: null,
        uCausticsTexture: null,
        uCausticsIntensity: 1.0,
        uCausticsSpeed: 0.1,
        uCausticsScale: 0.1,
        uProximityNear: 5.0,
        uProximityFar: 30.0,
        uMinWaterTint: 0.15
    },
    vertexShader,
    fragmentShader
);

extend({ SeaFloorMaterial })

export { SeaFloorMaterial }