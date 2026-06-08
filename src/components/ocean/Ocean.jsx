import { useMemo, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useOceanGPGPU } from '../../gpgpu/useOceanGPGPU.js'

import '../../materials/OceanMaterial.js'

export default function Ocean({
    resolution, 
    patchSize, 
    amplitude,
    windSpeed, 
    windDirection,
    displacementScale,
    optics
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
        const { displacementY, displacementX, displacementZ } = updateGPGPU(gl, time);

        if (materialRef.current) {
            materialRef.current.uTime = time;

            // TEXTURE DISPLACEMENT
            materialRef.current.uniforms.uDisplacementY.value = displacementY;
            materialRef.current.uniforms.uDisplacementX.value = displacementX;
            materialRef.current.uniforms.uDisplacementZ.value = displacementZ;
            materialRef.current.uScale = displacementScale;

            //BASIC OPTICS
            materialRef.current.uniforms.uWaterDeep.value.set(optics.waterDeep);
            materialRef.current.uniforms.uWaterShallow.value.set(optics.waterShallow);
            materialRef.current.uColorMinHeight = optics.colorMinHeight;
            materialRef.current.uColorMaxHeight = optics.colorMaxHeight;

            //SPECULAR
            materialRef.current.uniforms.uSunPosition.value.set(...optics.sunPosition);
            materialRef.current.uniforms.uSunColor.value.set(optics.sunColor);
            materialRef.current.uSpecularPower = optics.specularPower;
            materialRef.current.uSpecularMin = optics.specularMin;
            materialRef.current.uSpecularMax = optics.specularMax;
            materialRef.current.uSpecularIntensity = optics.specularIntensity;

            //ENVIRONMENT
            materialRef.current.uniforms.uSkyColor.value.set(optics.skyColor);

            //SSS
            materialRef.current.uniforms.uWaterSSS.value.set(optics.waterSSS);
            materialRef.current.uSssPower = optics.sssPower;
            materialRef.current.uSssScale = optics.sssScale;
            materialRef.current.uSssMinHeight = optics.sssMinHeight;
            materialRef.current.uSssMaxHeight = optics.sssMaxHeight;
            materialRef.current.uSssWrap = optics.sssWrap;
            
            //FOAM
            materialRef.current.uniforms.uFoamColor.value.set(optics.foamColor);
            materialRef.current.uFoamThreshold = optics.foamThreshold;
            materialRef.current.uFoamScale = optics.foamScale;
            materialRef.current.uniforms.uFoamSpeed.value.set(...optics.foamSpeed); 
            materialRef.current.uFoamDistortion = optics.foamDistortion;
            materialRef.current.uFoamEdgeSoftness = optics.foamEdgeSoftness;
        }
    });

    return (<>
        <mesh geometry={oceanGeometry}>
            <oceanMaterial 
                    ref={materialRef} 
                    glslVersion={THREE.GLSL3} 
                    wireframe={false} 
                />
        </mesh>

        <ambientLight intensity={0.5} />
        </>
    );
}