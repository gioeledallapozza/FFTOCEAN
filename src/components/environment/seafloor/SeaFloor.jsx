import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTextures } from '../../../helpers/useTextures.js';
import { useSeaFloorGPGPU } from '../../../gpgpu/useSeaFloorGPGPU.js';
import '../../../materials/SeaFloorMaterial.js';

export default function SeaFloor({
    waterDeepColor,
    waterShallowColor,
    sandColor,
    sandHeight,
    maxDepth,
    textureScale,
    causticsIntensity,
    causticsSpeed,
    causticsScale,
    proximityNear,
    proximityFar,
    minWaterTint
}) {
    const materialRef = useRef();
    const textures = useTextures();
    const causticsTexture = useSeaFloorGPGPU(256);

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

    useFrame(({ clock }) => {
        if (materialRef.current) {

            //UNIFORMS
            materialRef.current.uTime = clock.getElapsedTime();
            materialRef.current.uSandColor.set(sandColor);
            materialRef.current.uWaterDeepColor.set(waterDeepColor);
            materialRef.current.uWaterShallowColor.set(waterShallowColor);
            materialRef.current.uMaxDepth = maxDepth;
            materialRef.current.uTextureScale = textureScale;
            materialRef.current.uSandTexture = textures.sand;
            materialRef.current.uCausticsTexture = causticsTexture;
            materialRef.current.uCausticsIntensity = causticsIntensity;
            materialRef.current.uCausticsSpeed = causticsSpeed;
            materialRef.current.uCausticsScale = causticsScale;

            materialRef.current.uProximityNear = proximityNear;
            materialRef.current.uProximityFar = proximityFar;
            materialRef.current.uMinWaterTint = minWaterTint;
        }
    });

    return (
        <>
        <mesh layers={1} geometry={floorGeometry} position={[0, sandHeight, 0]} frustumCulled={false}>
            <seaFloorMaterial 
                ref={materialRef}
                depthWrite={true}
            />
        </mesh>

        </>
    );
}