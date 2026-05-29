import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useOceanGPGPU } from '../gpgpu/useOceanGPGPU.js'

//Old CPU ocean
import '../materials/OceanMaterial.js'
import { OceanEngine } from '../cpu_math/OceanEngine.js';

/* eslint-disable react-hooks/immutability */

export default function Ocean() {
    const resolution = 128;
    const patchSize = 1000.0;

    // Inizializza la scatola nera GPGPU
    const { displacementTexture, updateGPGPU } = useOceanGPGPU(resolution);

    const oceanGeometry = useMemo(() => {
        const geometry = new THREE.PlaneGeometry(patchSize, patchSize, resolution, resolution);
        geometry.rotateX(-Math.PI / 2); 
        return geometry;
    }, [patchSize, resolution]);

    useFrame(({ gl }) => {
        //Update texture
        updateGPGPU(gl);
    });

    return (
        <mesh geometry={oceanGeometry}>
            <meshBasicMaterial map={displacementTexture} />
        </mesh>
    );
}