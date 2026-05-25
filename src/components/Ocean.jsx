import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import '../materials/OceanMaterial.js'
// import { generateOceanHeightBuffer } from '../cpu_math/OceanGenerator.js';
import { OceanEngine } from '../cpu_math/OceanEngine.js';

export default function Ocean() {
    const materialRef = useRef();
    const resolution = 128;
    const patchSize = 1000.0;

    useFrame((state) => 
    {
        const time = state.clock.getElapsedTime();

        if (materialRef.current)
            materialRef.current.uTime = time;

        const newHeights = oceanEngine.generateFrame(time);

        displacementTexture.image.data.set(newHeights); //Update texture data
        displacementTexture.needsUpdate = true;
    });

    //Ocean Engine
    const oceanEngine = useMemo(() => {
        const angle = 45 * (Math.PI / 180);
        const windDir = { 
            x: Math.cos(angle), 
            y: Math.sin(angle) 
        };
        const windSpeed = 20.0;
        
        return new OceanEngine(resolution, patchSize, windSpeed, windDir, 0.05); 
    }, [resolution, patchSize]);

    //Generate displacement texture using CPU (only for test)
    const displacementTexture = useMemo(() => {

        const emptyBuffer = new Float32Array(resolution * resolution);

        const texture = new THREE.DataTexture(
            emptyBuffer, 
            resolution, 
            resolution, 
            THREE.RedFormat,
            THREE.FloatType
        );

        texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        // texture.minFilter = THREE.LinearFilter;
        // texture.magFilter = THREE.LinearFilter;
        
        return texture;
    }, [resolution, patchSize]);

    //Geometry Setup
    const oceanGeometry = useMemo(() => {

        const geometry = new THREE.PlaneGeometry(patchSize, patchSize, resolution, resolution);
        geometry.rotateX(-Math.PI / 2); //Rotate the plane once at the start to make it horizontal
    
        return geometry;
    }, [resolution, patchSize]);

    return <>
        <mesh geometry={oceanGeometry}>
            <oceanMaterial 
                ref = { materialRef } 
                uDisplacementMap = { displacementTexture }
                wireframe = { false }
            />
        </mesh>
    </>
}