import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

export function useOceanLOD(meshRef, materialRef) {
    
    useEffect(() => {
        if (meshRef.current) {
            // BoundingBox useless
            // Disable frustumCulled to avoid the ocean to disapear in the horizon
            meshRef.current.frustumCulled = false;
        }
    }, [meshRef]);

    //Update camera position every frame
    useFrame(({ camera }) => {
        if (materialRef.current && materialRef.current.uniforms.uViewerPos) {
            //Pass the view position
            materialRef.current.uniforms.uViewerPos.value.set(camera.position.x, camera.position.z);
        }
    });
}