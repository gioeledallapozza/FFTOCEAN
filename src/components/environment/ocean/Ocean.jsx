import { useMemo, useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useOceanGPGPU } from '../../../gpgpu/useOceanGPGPU.js'
import { useTextures } from '../../../helpers/useTextures.js'
import { useOceanLOD } from '../../../geometry/lod/useOceanLOD.js'
import { ClipmapGeometry } from '../../../geometry/lod/ClipmapGeometry.js'
import '../../../materials/OceanMaterial.js'

export default function Ocean({
    resolution, 
    fftResolution,
    patchSize, 
    amplitude,
    choppyScale,
    windSpeed, 
    windDirection,
    displacementScale,
    sunPosition,
    sunColor,
    fogColor,
    turbidity,
    sunGlowSize,
    optics
}) {

    const materialRef = useRef();   //Reference to the material of the ocean mesh
    const meshRef = useRef();       // Reference to the clipmap mesh
    const gpgpuTimer = useRef(0.0); // Accumulator for throttling
    
    const { scene } = useThree();

    const textures = useTextures(); //Load textures
    useOceanLOD(meshRef, materialRef); //Call the LOD
    const { updateGPGPU } = useOceanGPGPU(fftResolution, patchSize, amplitude, windSpeed, windDirection);

    useEffect(() => {
        // Force the execution of the FFT calculation
        gpgpuTimer.current = 100.0; 
    }, [fftResolution, patchSize, amplitude, windSpeed, windDirection]);

    //Geometry
    const oceanGeometry = useMemo(() => {
        //TODO: add to leva
        const levels = 5; 
        
        //Distance from vertices
        const baseVertexSpacing = patchSize / resolution; 

        const geometry = new ClipmapGeometry(resolution, levels, baseVertexSpacing);
        return geometry;
    }, [patchSize, resolution]);

    //Garbage collector
    useEffect(() => {
        return () => {
            oceanGeometry.dispose();
        };
    }, [oceanGeometry]);

    useFrame(({ gl, clock }, delta) => {
        const time = clock.getElapsedTime();

        if (materialRef.current) {
            materialRef.current.uTime = time;

            // GEOMETRY PROPERTIES
            materialRef.current.uResolution = resolution;
            materialRef.current.uBaseVertexSpacing = patchSize / resolution;
            materialRef.current.uPatchSize = patchSize;
            materialRef.current.uScale = displacementScale;
            materialRef.current.uChoppyScale = choppyScale;
            materialRef.current.uNormalScale = optics.normalScale;

            //BASIC OPTICS
            materialRef.current.uniforms.uWaterDeep.value.set(optics.waterDeep);
            materialRef.current.uniforms.uWaterShallow.value.set(optics.waterShallow);
            materialRef.current.uColorMinHeight = optics.colorMinHeight;
            materialRef.current.uColorMaxHeight = optics.colorMaxHeight;

            //SPECULAR
            materialRef.current.uniforms.uSunPosition.value.copy(sunPosition);
            materialRef.current.uniforms.uSunColor.value.set(sunColor);
            materialRef.current.uSpecularPower = optics.specularPower;
            materialRef.current.uSpecularMin = optics.specularMin;
            materialRef.current.uSpecularMax = optics.specularMax;
            materialRef.current.uSpecularIntensity = optics.specularIntensity;
            materialRef.current.uFresnelSmoothness = optics.fresnelSmoothness;
            materialRef.current.uFadeStart = optics.fadeStart;
            materialRef.current.uFadeEnd = optics.fadeEnd;

            //ENVIRONMENT
            if (scene.environment) {
                materialRef.current.uniforms.uEnvMap.value = scene.environment;
            }

            //SSS
            materialRef.current.uniforms.uWaterSSS.value.set(optics.waterSSS);
            materialRef.current.uSssPower = optics.sssPower;
            materialRef.current.uSssScale = optics.sssScale;
            materialRef.current.uSssMinHeight = optics.sssMinHeight;
            materialRef.current.uSssMaxHeight = optics.sssMaxHeight;
            materialRef.current.uSssWrap = optics.sssWrap;
            
            //FOAM
            materialRef.current.uniforms.uFoamColor.value.set(optics.foamColor);
            materialRef.current.uniforms.uFoamTexture.value = textures.foam;
            materialRef.current.uFoamThreshold = optics.foamThreshold;
            materialRef.current.uFoamScale = optics.foamScale;
            materialRef.current.uniforms.uFoamSpeed.value.set(...optics.foamSpeed); 
            materialRef.current.uFoamDistortion = optics.foamDistortion;
            materialRef.current.uFoamEdgeSoftness = optics.foamEdgeSoftness;
            materialRef.current.uFoamPower = optics.foamPower;

            // FOG
            if (fogColor) {
                materialRef.current.uniforms.uFogColor.value.set(fogColor);
            }
            materialRef.current.uFogDensity = optics.fogDensity;
            materialRef.current.uFogSunScattering = optics.fogSunScattering;
            materialRef.current.uTurbidity = turbidity;
            materialRef.current.uSunGlowSize = sunGlowSize;
        }

        //GPGPU Physics
        //Throttled at 30 FPS
        gpgpuTimer.current += delta;
        const GPGPU_INTERVAL = 1.0 / 30.0; //30 FPS

        if (gpgpuTimer.current >= GPGPU_INTERVAL) {
            //Update texture
            const { displacementY, displacementX, displacementZ } = updateGPGPU(gl, time);

            if (materialRef.current) {
                // TEXTURE DISPLACEMENT
                materialRef.current.uniforms.uDisplacementY.value = displacementY;
                materialRef.current.uniforms.uDisplacementX.value = displacementX;
                materialRef.current.uniforms.uDisplacementZ.value = displacementZ;
            }

            // Keeps the temporal remainder
            gpgpuTimer.current = gpgpuTimer.current % GPGPU_INTERVAL;
        }
    });

    return (<>
        <mesh ref={meshRef} geometry={oceanGeometry}>
            <oceanMaterial 
                    ref={materialRef}
                    toneMapped={true}
                    glslVersion={THREE.GLSL3} 
                    wireframe={false} 
            />
        </mesh>
        </>
    );
}