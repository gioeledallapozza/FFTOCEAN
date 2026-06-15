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


        // TRIGGER DA CONSOLE: Scrivi window.debugGPGPU = true nella console del browser per attivarlo
       if (window.debugGPGPU) {
            const pixelData = new Float32Array(4); 
            const webgl = gl.getContext();
            
            // ATTENZIONE QUI: Assicurati di usare il RenderTarget Z!
            gl.setRenderTarget(displacementZ.renderTarget); 

            // Leggiamo il Target 1 (dove dovrebbero risiedere Choppy Z e Slope Z)
            webgl.readBuffer(webgl.COLOR_ATTACHMENT1); 

            // Leggiamo un pixel al centro per sicurezza (se resolution è 256, metti 128)
            webgl.readPixels(128, 128, 1, 1, webgl.RGBA, webgl.FLOAT, pixelData);

            webgl.readBuffer(webgl.COLOR_ATTACHMENT0);
            gl.setRenderTarget(null);

            console.log("=== DATI MATEMATICI CRUDI TARGET 2 (ASSE Z) ===");
            console.log("Canale R (Choppy Z):", pixelData[0]);
            console.log("Canale G (Vuoto):",    pixelData[1]);
            console.log("Canale B (SLOPE Z!):", pixelData[2]); 
            console.log("Canale A (Vuoto):",    pixelData[3]);
            
            window.debugGPGPU = false; 
        }

        if (materialRef.current) {
            materialRef.current.uTime = time;

            // TEXTURE DISPLACEMENT
            materialRef.current.uniforms.uDisplacementY.value = displacementY;
            materialRef.current.uniforms.uDisplacementX.value = displacementX;
            materialRef.current.uniforms.uDisplacementZ.value = displacementZ;
            materialRef.current.uScale = displacementScale;
            materialRef.current.uNormalScale = optics.normalScale;

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
        </>
    );
}