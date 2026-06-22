import { useMemo } from 'react'
import * as THREE from 'three'
import { useControls, folder } from 'leva'
import Ocean from './Ocean.jsx'

//Get screen size
const getInitialFftResolution = () => {
    if (typeof window !== 'undefined') {
        return window.innerWidth <= 768 ? 128 : 256;
    }
    return 256;
};

export default function OceanManager({depthTexture, oceanDataRef, sunPosition, sunColor, fogColor, turbidity, sunGlowSize, sunDiskSize, sunDiskIntensity, sunGlowIntensity, waterDeepColor, waterShallowColor }) {
    
    // Ocean parameters
    const { resolution, fftResolution, patchSize, displacementScale, amplitude, choppyScale } = useControls('Ocean Core', {
        resolution: { 
            options: { 
                '64 (Low)': 64, 
                '128 (Med)': 128, 
                '256 (High)': 256, 
                '512 (Ultra)': 512,
                '1024 (Death)': 1024
            }, value: 256 },
        fftResolution: { 
            options: { 
                '64 (Low)': 64, 
                '128 (Med)': 128, 
                '256 (High)': 256, 
                '512 (Ultra)': 512,
                '1024 (Death)': 1024 
            }, 
            value: getInitialFftResolution() 
        },
        patchSize: {  value: 250.0, min: 100.0, max: 10000.0, step: 100.0 },
        displacementScale: { value: 1.0, min: 0.1, max: 1.5, step: 0.1 },
        amplitude: { value: 0.01, min: 0.0000001, max: 0.15, step: 0.001 },
        choppyScale: { value: 1.5, min: 0.0, max: 15.0, step: 0.01}
    }, { collapsed: true });

    const { windSpeed, windDirX, windDirY } = useControls('Ocean Wind', {
        windSpeed: { value: 15.0, min: 1.0, max: 50.0, step: 0.1 },
        windDirX: { value: 0.4, min: -1.0, max: 1.0, step: 0.01 },
        windDirY: { value: 0.8, min: -1.0, max: 1.0, step: 0.01 },
    }, { collapsed: true });

    // Recalculate vector
    const windDirection = useMemo(() => {
        return new THREE.Vector2(windDirX, windDirY).normalize();
    }, [windDirX, windDirY]);


    //Optics controls
    const opticsControls = useControls('Ocean Optics', {
        //Normals
        Normals: folder({
            normalScale: { value: 1.0, min: 0.0, max: 1.5, step: 0.01 },
        }, { collapsed: true }),
        // Base colors
        Basic: folder({
            colorMinHeight: {  value: -4.5, min: -10.0, max: 0.0, step: 0.1 },
            colorMaxHeight: { value: 1.5, min: 0.0, max: 10.0, step: 0.1 }
        }, { collapsed: true }),
        //SPECULAR
        Specular: folder({
            specularPower: { value: 250.0, min: 10.0, max: 300.0, step: 1.0 },
            specularMin: { value: 0.90, min: 0.0, max: 1.0, step: 0.01 },
            specularMax: { value: 0.99, min: 0.0, max: 1.0, step: 0.01 },
            specularIntensity: { value: 4.7, min: 0.0, max: 10.0, step: 0.1 },
            fresnelSmoothness: { value:  0.5, min: 0.0, max: 1.0, step: 0.01 },
            fadeStart: { value:  patchSize * 2.0, min: 0.0, max: patchSize * 16.0, step: 0.01 },
            fadeEnd: { value:  patchSize * 14.0, min: 0.0, max: patchSize * 16.0, step: 0.01 } //patchSize x lod levels Math.pow(2, levels - 1)
        }, { collapsed: true }),
        
        // Subsurface Scattering (SSS)
        SSS: folder({
            waterSSS: { value: '#3b72ba' }, //#5393e6
            sssPower: { value: 4.7, min: 1.0, max: 20.0, step: 0.1 },
            sssScale: { value: 2.0, min: 0.0, max: 5.0, step: 0.1 },
            sssMinHeight: { value: -0.2, min: -2.0, max: 2.0, step: 0.01 },
            sssMaxHeight: { value: 1.0, min: -2.0, max: 5.0, step: 0.01 },
            sssWrap: { value: 0.38, min: 0.0, max: 1.0, step: 0.01 },
            sssDistortion: { value: 0.4, min: 0.0, max: 1.0, step: 0.01 }
        }, { collapsed: true }),
        
        // Foam
        Foam: folder({
            foamColor: { value: '#ffffff' },
            foamThreshold: { value: 0.4, min: 0.0, max: 1.0, step: 0.01 }, 
            foamScale: { value: 7.0, min: 1.0, max: 50.0, step: 0.1 },
            foamSpeed: [0.2, 0.2], // Lento è più realistico
            foamDistortion: { value: 1.4, min: 0.1, max: 2.0, step: 0.01 }, 
            foamEdgeSoftness: { value: 0.8, min: 0.01, max: 1, step: 0.01 }, 
            foamPower: { value: 0.5, min: 0.5, max: 5.0, step: 0.1 } 
        }, { collapsed: true }),
        Fog: folder({
            fogDensity: { value: 0.0005, min: 0.0, max: 0.01, step: 0.0001 },
            fogSunScattering: { value: 2.5, min: 0.0, max: 10.0, step: 0.01 },
            waterClarity: { value: 25.0, min: 1.0, max: 100.0, step: 1.0 }
        }, { collapsed: true })
    }, { collapsed: true });

    return (
        <Ocean 
            key={`ocean-core-${resolution}-${fftResolution}`}
            resolution={resolution}
            fftResolution={fftResolution}
            patchSize={patchSize}
            amplitude={amplitude}
            choppyScale={choppyScale}
            windSpeed={windSpeed}
            windDirection={windDirection}
            displacementScale={displacementScale}
            depthTexture={depthTexture}
            oceanDataRef={oceanDataRef}
            sunPosition={sunPosition}
            sunColor={sunColor}
            fogColor={fogColor}
            turbidity={turbidity}
            sunGlowSize={sunGlowSize}
            sunDiskSize={sunDiskSize}
            sunDiskIntensity={sunDiskIntensity}
            sunGlowIntensity={sunGlowIntensity}
            waterDeepColor={waterDeepColor}
            waterShallowColor={waterShallowColor}
            optics={opticsControls}
        />
    )
}