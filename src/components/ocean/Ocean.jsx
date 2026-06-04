import { useMemo, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useOceanGPGPU } from '../../gpgpu/useOceanGPGPU.js'

import oceanVertex from '../../materials/shaders/oceanVertex.glsl';
import oceanFragment from '../../materials/shaders/oceanFragment.glsl';

export default function Ocean({
    resolution, 
    patchSize, 
    amplitude,
    windSpeed, 
    windDirection,
    displacementScale
}) {

    const materialRef = useRef(); //Reference to the material of the ocean mesh

    const { updateGPGPU } = useOceanGPGPU(resolution, patchSize, amplitude, windSpeed, windDirection);

    //Geometry rotatio
    const oceanGeometry = useMemo(() => {
        const geometry = new THREE.PlaneGeometry(patchSize, patchSize, resolution, resolution);
        geometry.rotateX(-Math.PI / 2); 
        return geometry;
    }, [patchSize, resolution]);

    //Garbage collector
    useEffect(() => {
        return () => {
            oceanGeometry.dispose();
        };
    }, [oceanGeometry]);

    //Custom uniforms for the ocean shader
    const customUniforms = useMemo(() => ({
        uDisplacementY: { value: null },
        uDisplacementX: { value: null },
        uDisplacementZ: { value: null },
        uScale: { value: displacementScale }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []);

    //Update scale uniform when it changes
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.uScale.value = displacementScale;
        }
    }, [displacementScale]);


    useFrame(({ gl, clock }) => {
        const time = clock.getElapsedTime();
        //Update texture
        const { displacementY, displacementX, displacementZ } = updateGPGPU(gl, time);

     if (materialRef.current) {
            materialRef.current.uniforms.uDisplacementY.value = displacementY;
            materialRef.current.uniforms.uDisplacementX.value = displacementX;
            materialRef.current.uniforms.uDisplacementZ.value = displacementZ;
        }
    });

    return (<>
        <mesh geometry={oceanGeometry}>
            <shaderMaterial 
                ref={materialRef}
                vertexShader={oceanVertex}
                fragmentShader={oceanFragment}
                uniforms={customUniforms}
                wireframe={true}
            />
        </mesh>

        <ambientLight intensity={0.5} />
        </>
    );
}