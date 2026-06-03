import { useMemo } from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'
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

    return (
        <Ocean 
            resolution={resolution}
            patchSize={patchSize}
            amplitude={amplitude}
            windSpeed={windSpeed}
            windDirection={windDirection}
            displacementScale={displacementScale}
        />
    )
}