import { useMemo, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useOceanGPGPU } from '../../gpgpu/useOceanGPGPU.js'

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

    useFrame(({ gl, clock }) => {
        const time = clock.getElapsedTime();
        //Update texture
        const currentTexture = updateGPGPU(gl, time);

       if (materialRef.current) {
            materialRef.current.displacementMap = currentTexture;
            materialRef.current.displacementScale = displacementScale;
            materialRef.current.needsUpdate = true;
        }
    });

    return (<>
        <mesh geometry={oceanGeometry}>
            <meshStandardMaterial 
                ref={materialRef}
                displacementScale={0.25}
                wireframe={true} 
                color="cyan" // Solo per dare un colore di base al wireframe
            />
        </mesh>

        <ambientLight intensity={0.5} />
        </>
    );
}