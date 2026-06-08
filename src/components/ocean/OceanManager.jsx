import { useMemo } from 'react'
import * as THREE from 'three'
import { useControls, folder } from 'leva'
import Ocean from './Ocean.jsx'

export default function OceanManager() {
    
    // Ocean parameters
    const { resolution, patchSize, displacementScale, amplitude } = useControls('Ocean Core', {
        resolution: { 
            options: { 
                '64 (Low)': 64, 
                '128 (Med)': 128, 
                '256 (High)': 256, 
                '512 (Ultra)': 512 
            }, 
            value: 256 },
        patchSize: { 
            value: 1000.0, 
            min: 100.0, 
            max: 5000.0, 
            step: 100.0 
        },
        displacementScale: { 
            value: 0.2, 
            min: 0.1, 
            max: 10.0, 
            step: 0.1 
        },
        amplitude: {
            value: 1,
            min: 0.1,
            max: 100.0,
            step: 0.1
        }
    }, { collapsed: true });

    const { windSpeed, windDirX, windDirY } = useControls('Ocean Wind', {
        windSpeed: { 
            value: 28.0, 
            min: 1.0, 
            max: 50.0, 
            step: 0.1 
        },
        windDirX: { 
            value: 0.5, 
            min: -1.0, 
            max: 1.0, 
            step: 0.01 
        },
        windDirY: { 
            value: -0.3, 
            min: -1.0, 
            max: 1.0, 
            step: 0.01 
        },
    }, { collapsed: true });

    // Recalculate vector
    const windDirection = useMemo(() => {
        return new THREE.Vector2(windDirX, windDirY).normalize();
    }, [windDirX, windDirY]);


    //Optics controls
    const opticsControls = useControls('Ocean Optics', {
        // Base colors
        Basic: folder({
            waterDeep: { value: '#03656e' },
            waterShallow: { value: '#03808b' },
            colorMinHeight: {  value: -10.0, min: -10.0, max: 0.0, step: 0.1 },
            colorMaxHeight: { value: 10.0, min: 0.0, max: 10.0, step: 0.1 }
        }),
        //SPECULAR
        Specular: folder({
            sunPosition: [0.0, 20.0, -500.0],
            sunColor: { value: '#ffe599' }, 
            specularPower: { value: 16.0, min: 10.0, max: 300.0, step: 1.0 },
            specularMin: { value: 0.0, min: 0.0, max: 1.0, step: 0.01 },
            specularMax: { value: 1.0, min: 0.0, max: 1.0, step: 0.01 },
            specularIntensity: { value: 2.0, min: 0.0, max: 10.0, step: 0.1 }
        }),

        //Temporary Sky color
        Environment: folder({
            skyColor: { value: '#d6d6b6' }
        }),
        
        // Subsurface Scattering (SSS)
        SSS: folder({
            waterSSS: { value: '#43c3ab' },
            sssPower: { value: 5.0, min: 1.0, max: 20.0, step: 0.1 },
            sssScale: { value: 0.5, min: 0.0, max: 5.0, step: 0.1 },
            sssMinHeight: { value: -0.2, min: -2.0, max: 2.0, step: 0.01 },
            sssMaxHeight: { value: 1.0, min: -2.0, max: 5.0, step: 0.01 },
            sssWrap: { value: 0.2, min: 0.0, max: 1.0, step: 0.01 }
        }),
        
        // Foam
        Foam: folder({
            foamColor: { value: '#ffffff' },
            foamThreshold: { value: 25.5, min: -10.0, max: 50.0, step: 0.1 },
            foamScale: { value: 30.0, min: 1.0, max: 100.0, step: 0.1 },
            foamSpeed: [0.4, 0.8],
            foamDistortion: { value: 0.8, min: 0.0, max: 3.0, step: 0.01 },
            foamEdgeSoftness: { value: 0.1, min: 0.001, max: 1.0, step: 0.01 }
        })
    });

    return (
        <Ocean 
            resolution={resolution}
            patchSize={patchSize}
            amplitude={amplitude}
            windSpeed={windSpeed}
            windDirection={windDirection}
            displacementScale={displacementScale}
            optics={opticsControls}
        />
    )
}