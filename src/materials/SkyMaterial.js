import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

import skyVertex from './shaders/sky/skyVertex.glsl';
import skyFragment from './shaders/sky/skyFragment.glsl';

const SkyMaterial = shaderMaterial(
    {
        //Colors
        uTopColor: new THREE.Vector3(0, 0, 0),
        uBottomColor: new THREE.Vector3(0, 0, 0),

        //Sun
        uSunPosition: new THREE.Vector3(0, 1, 0),
        uSunColor: new THREE.Vector3(0,0,0),
        uSunDiskSize: 0.9995,
        uSunGlowSize: 0.98,
        uSunDiskIntensity: 2.0,
        uSunGlowIntensity: 0.8,
        
        
        uTurbidity: 10,
        uRayleigh: 2,
        // ... SoT uniforms
    },
    skyVertex,
    skyFragment
);

extend({ SkyMaterial });

export default SkyMaterial;