import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

import oceanVertexShader from './shaders/ocean/oceanVertex.glsl'
import oceanFragmentShader from './shaders/ocean/oceanFragment.glsl'

// shaderMaterial( defaultUniforms, vertexShader, fragmentShader )
const OceanMaterial = shaderMaterial(
    { 
        uTime: 0,
        // Displacement Textures
        uDisplacementY: null,
        uDisplacementX: null,
        uDisplacementZ: null,
        uScale: 1.0,
        uChoppyScale: 2.0,
        uNormalScale: 0.0,


        // Basic Optics
        uWaterDeep: new THREE.Color('#002b4f'),
        uWaterShallow: new THREE.Color('#00a4b4'),
        uColorMinHeight: -2.0,
        uColorMaxHeight: 2.0,

        // Specular
        uSunPosition: new THREE.Vector3(0.0, 0.0, -500.0),
        uSunColor: new THREE.Color('#ffe599'),
        uSpecularPower: 300.0,
        uSpecularMin: 0.4,
        uSpecularMax: 0.45,
        uSpecularIntensity: 2.0,
        uFresnelSmoothness: 0.5,

        // Environment
        uEnvMap: null,
        
        // Subsurface Scattering (SSS)
        uWaterSSS: new THREE.Color('#43c3ab'),
        uSssPower: 5.0,
        uSssScale: 0.5,
        uSssMinHeight: -0.2,
        uSssMaxHeight: 1.0, 
        uSssWrap: 0.2,

        // Foam
        uFoamColor: new THREE.Color('#ffffff'),
        uFoamTexture: null,
        uFoamThreshold: 0.8,
        uFoamScale: 30.0,
        uFoamSpeed: new THREE.Vector2(0.4, 0.8), // Vector2!
        uFoamDistortion: 0.8,
        uFoamEdgeSoftness: 0.1,
        uFoamPower: 3.0
    },
    oceanVertexShader,
    oceanFragmentShader
);

// extend to R3F
extend({ OceanMaterial });

export { OceanMaterial };