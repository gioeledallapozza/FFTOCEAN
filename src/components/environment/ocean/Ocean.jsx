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
    depthTexture,
    oceanDataRef,
    sunPosition,
    sunColor,
    fogColor,
    turbidity,
    sunGlowSize,
    sunDiskSize,
    sunDiskIntensity,
    sunGlowIntensity,
    waterDeepColor,
    waterShallowColor,
    optics
}) {

    const materialRef = useRef();   //Reference to the material of the ocean mesh
    const meshRef = useRef();       // Reference to the clipmap mesh
    const gpgpuTimer = useRef(0.0); // Accumulator for throttling
    
    const { scene, camera, size, viewport } = useThree();

    const textures = useTextures(); //Load textures
    useOceanLOD(meshRef, materialRef); //Call the LOD
    const { updateGPGPU } = useOceanGPGPU(fftResolution, patchSize, amplitude, windSpeed, windDirection);

    useEffect(() => {
        // Force the execution of the FFT calculation
        gpgpuTimer.current = 100.0; 
    }, [fftResolution, patchSize, amplitude, windSpeed, windDirection]);

    useEffect(() => {
        if (!materialRef.current) return;
        const mat = materialRef.current;

        mat.uResolution = resolution;
        mat.uBaseVertexSpacing = patchSize / resolution;
        mat.uPatchSize = patchSize;
        mat.uScale = displacementScale;
        mat.uChoppyScale = choppyScale;
        mat.uNormalScale = optics.normalScale;

        mat.uniforms.uWaterDeep.value.set(waterDeepColor);
        mat.uniforms.uWaterShallow.value.set(waterShallowColor);
        mat.uColorMinHeight = optics.colorMinHeight;
        mat.uColorMaxHeight = optics.colorMaxHeight;

        mat.uniforms.uSunPosition.value.copy(sunPosition);
        mat.uniforms.uSunColor.value.set(sunColor);
        mat.uSpecularPower = optics.specularPower;
        mat.uSpecularMin = optics.specularMin;
        mat.uSpecularMax = optics.specularMax;
        mat.uSpecularIntensity = optics.specularIntensity;
        mat.uFresnelSmoothness = optics.fresnelSmoothness;
        mat.uFadeStart = optics.fadeStart;
        mat.uFadeEnd = optics.fadeEnd;

        if (scene.environment) {
            mat.uniforms.uEnvMap.value = scene.environment;
        }

        mat.uniforms.uWaterSSS.value.set(optics.waterSSS);
        mat.uSssPower = optics.sssPower;
        mat.uSssScale = optics.sssScale;
        mat.uSssMinHeight = optics.sssMinHeight;
        mat.uSssMaxHeight = optics.sssMaxHeight;
        mat.uSssWrap = optics.sssWrap;
        mat.uSssDistortion = optics.sssDistortion;
        
        mat.uniforms.uFoamColor.value.set(optics.foamColor);
        if (textures.foam) mat.uniforms.uFoamTexture.value = textures.foam;
        mat.uFoamThreshold = optics.foamThreshold;
        mat.uFoamScale = optics.foamScale;
        mat.uniforms.uFoamSpeed.value.set(...optics.foamSpeed);
        mat.uFoamDistortion = optics.foamDistortion;
        mat.uFoamEdgeSoftness = optics.foamEdgeSoftness;
        mat.uFoamPower = optics.foamPower;

        mat.uniforms.uFogColor.value.set(fogColor);
        mat.uFogDensity = optics.fogDensity;
        mat.uFogSunScattering = optics.fogSunScattering;
        mat.uTurbidity = turbidity;
        mat.uWaterClarity = optics.waterClarity;
        mat.uSunGlowSize = sunGlowSize;
        mat.uSunDiskSize = sunDiskSize;
        mat.uSunDiskIntensity = sunDiskIntensity;
        mat.uSunGlowIntensity = sunGlowIntensity;   

        mat.uniforms.uSeafloorDepth.value = depthTexture;
        mat.uniforms.uScreenResolution.value.set(
            Math.floor(size.width * viewport.dpr), 
            Math.floor(size.height * viewport.dpr)
        );
        mat.uCameraNear = camera.near;
        mat.uCameraFar = camera.far;
    }, [camera.far, camera.near, depthTexture, displacementScale, choppyScale, sunPosition, fogColor, patchSize, resolution, scene.environment, sunColor, sunGlowIntensity, sunGlowSize, sunDiskIntensity, sunDiskSize, textures.foam, turbidity, waterDeepColor, waterShallowColor, optics, viewport.dpr, size.height, size.width]);

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

            if (oceanDataRef && oceanDataRef.current) {
                oceanDataRef.current.displacementY = displacementY;
                oceanDataRef.current.patchSize = patchSize;
                oceanDataRef.current.scale = displacementScale;
                oceanDataRef.current.waterDeepColor = waterDeepColor;
                oceanDataRef.current.waterClarity = optics.waterClarity; 
            }

            // Keeps the temporal remainder
            gpgpuTimer.current = gpgpuTimer.current % GPGPU_INTERVAL;
        }
    });

    return (<>
        <mesh ref={meshRef} geometry={oceanGeometry} frustumCulled={false}>
            <oceanMaterial 
                ref={materialRef}
                side={THREE.DoubleSide}
                transparent={true}
                glslVersion={THREE.GLSL3} 
                wireframe={false} 
            />
        </mesh>
        </>
    );
}