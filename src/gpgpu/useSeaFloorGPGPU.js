import { useMemo, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ComputePass from './ComputePass.js';

import causticsVertex from './shaders/caustics/causticsVertex.glsl';
import causticsFragment from './shaders/caustics/causticsFragment.glsl';

export function useSeaFloorGPGPU(resolution = 256) {
    const { gl } = useThree();

    // Setup single RenderTarget
    const renderTarget = useMemo(() => {
        return new THREE.WebGLRenderTarget(resolution, resolution, {
            type: THREE.HalfFloatType,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            wrapS: THREE.RepeatWrapping,
            wrapT: THREE.RepeatWrapping,
            depthBuffer: false,
            stencilBuffer: false,
            generateMipmaps: false
        });
    }, [resolution]);

    // Compute Pass setup
    const computePass = useMemo(() => {
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 }
            },
            vertexShader: causticsVertex,
            fragmentShader: causticsFragment
        });
        
        return new ComputePass(material);
    }, []);

    // Garbage collector
    useEffect(() => {
        return () => {
            computePass.material.dispose();
            computePass.geometry.dispose(); 
            renderTarget.dispose();
        };
    }, [computePass, renderTarget]);

    // LOOP
    useFrame(({ clock }) => {
        const currentRenderTarget = gl.getRenderTarget();
        //UNIFORMS
        // eslint-disable-next-line react-hooks/immutability
        computePass.material.uniforms.uTime.value = clock.getElapsedTime();
        
        //RENDER
        computePass.render(gl, renderTarget);
        
        gl.setRenderTarget(currentRenderTarget);
    });

    return renderTarget.texture;
}