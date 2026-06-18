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
    patchSize, 
    amplitude,
    choppyScale,
    windSpeed, 
    windDirection,
    displacementScale,
    sunPosition,
    sunColor,
    optics
}) {

    const materialRef = useRef();   //Reference to the material of the ocean mesh
    const meshRef = useRef();       // Reference to the clipmap mesh

    const { scene } = useThree();

    const textures = useTextures(); //Load textures
    useOceanLOD(meshRef, materialRef); //Call the LOD
    const { updateGPGPU } = useOceanGPGPU(resolution, patchSize, amplitude, windSpeed, windDirection);

    //Geometry 
    // const oceanGeometry = useMemo(() => {
    //     const geometry = new THREE.PlaneGeometry(patchSize, patchSize, resolution, resolution);
    //     geometry.rotateX(-Math.PI / 2); 
    //     return geometry;
    // }, [patchSize, resolution]);
    const oceanGeometry = useMemo(() => {
        //TODO: add to leva
        const levels = 6; 
        
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
            materialRef.current.uFresnelSmoothness = optics.fresnelSmoothness

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
        }
    });

    return (<>
        <mesh ref={meshRef} geometry={oceanGeometry}>
            <oceanMaterial 
                    ref={materialRef} 
                    glslVersion={THREE.GLSL3} 
                    wireframe={false} 
            />
        </mesh>
        </>
    );
}