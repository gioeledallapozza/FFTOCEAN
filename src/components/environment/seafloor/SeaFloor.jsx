import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTextures } from '../../../helpers/useTextures.js';
import '../../../materials/SeaFloorMaterial.js';

export default function SeaFloor({
    waterDeepColor,
    sandColor,
    maxDepth,
    textureScale
}) {
    const materialRef = useRef();
    const textures = useTextures();

    const floorGeometry = useMemo(() => {
        const geometry = new THREE.PlaneGeometry(4000, 4000, 128, 128);
        geometry.rotateX(-Math.PI / 2);
        return geometry;
    }, []);

    useEffect(() => {
        return () => {
            floorGeometry.dispose();
        };
    }, [floorGeometry]);

    // Setup del Texture Wrapping (eseguito solo quando la texture carica)
    useEffect(() => {
        if (textures.sand) {
            textures.sand.wrapS = THREE.RepeatWrapping;
            textures.sand.wrapT = THREE.RepeatWrapping;
            textures.sand.needsUpdate = true;
        }
    }, [textures.sand]);

    useFrame(({ clock }) => {
        if (materialRef.current) {

            //UNIFORMS
            materialRef.current.uTime = clock.getElapsedTime();
            materialRef.current.uSandColor.set(sandColor);
            materialRef.current.uWaterDeepColor.set(waterDeepColor);
            materialRef.current.uMaxDepth = maxDepth;
            materialRef.current.uTextureScale = textureScale;
            materialRef.current.uSandTexture = textures.sand;
        }
    });

    return (
        <mesh geometry={floorGeometry} position={[0, -60, 0]}>
            <seaFloorMaterial ref={materialRef} />
        </mesh>
    );
}