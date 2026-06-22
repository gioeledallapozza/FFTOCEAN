import { useMemo } from 'react';
import * as THREE from 'three';
import { useControls, folder } from 'leva';
import { Environment } from '@react-three/drei';
import OceanManager from './ocean/OceanManager';
import SkyManager from './sky/SkyManager';
import SeaFloorManager from './seafloor/SeaFloorManager';

export default function EnvironmentManager({depthTexture, oceanDataRef}) {

    //Global variables  
    const { sunDistance, sunTheta, sunPhi, sunColor, 
            topColor, bottomColor, turbidity, rayleigh, sunGlowSize, sunDiskSize, sunDiskIntensity, sunGlowIntensity,
            waterDeepColor, waterShallowColor 
        } = useControls('Global Environment', {
        Sun: folder({
            sunDistance: { value: 500.0, min: 100.0, max: 2000.0, step: 10.0 },
            sunTheta: { value: 1.44, min: 0, max: Math.PI, step: 0.01 }, 
            sunPhi: { value: 4.57, min: 0, max: Math.PI * 2, step: 0.01 },
            sunColor: { value: '#ffdf70' },
            turbidity: { value: 6.0, min: 0.1, max: 20, step: 0.1 },
            rayleigh: { value: 1.2, min: 0, max: 4, step: 0.1 },
            sunGlowSize: { value: 0.999, min: 0.900, max: 0.9999, step: 0.0001 },
            sunDiskSize: { value: 0.9999, min: 0.9800, max: 0.99999, step: 0.00001 },
            sunDiskIntensity: { value: 1.5, min: 0.0, max: 10.0, step: 0.1 },
            sunGlowIntensity: { value: 4.5, min: 0.0, max: 5.0, step: 0.1 },
        }),
        Sky: folder({
            topColor: { value: '#064289' },
            bottomColor: { value: '#79b8d9' }
        }),
        Water: folder({
            waterDeepColor: { value: '#52b9e5 ' }, //#52b9e5 
            waterShallowColor: { value: '#59cdff' }, //#59cdff
        }, {collapsed: true})
    }, {collapsed: true});

    const globalSunPosition = useMemo(() => {
        const x = sunDistance * Math.sin(sunTheta) * Math.cos(sunPhi);
        const y = sunDistance * Math.cos(sunTheta);
        const z = sunDistance * Math.sin(sunTheta) * Math.sin(sunPhi);
        return new THREE.Vector3(x, y, z);
    }, [sunDistance, sunTheta, sunPhi]);
    const globalSunColor = useMemo(() => new THREE.Color(sunColor), [sunColor]);

    //Costruct the scene
    return (
        <>
            {/* 
                Everything inside Environment background generate a cubemap taht three.js will apply
                FrameInfinity for dinamyc sky. can be bad for performance
            */}
            <Environment background resolution={256} frames={1}>
                <SkyManager 
                    sunPosition={globalSunPosition} 
                    sunColor={globalSunColor}
                    topColor={topColor}
                    bottomColor={bottomColor}
                    turbidity={turbidity}
                    rayleigh={rayleigh}
                    sunGlowSize={sunGlowSize}
                    sunDiskSize={sunDiskSize}
                    sunDiskIntensity={sunDiskIntensity}
                    sunGlowIntensity={sunGlowIntensity}
                />
            </Environment>
            <OceanManager 
                depthTexture={depthTexture}
                oceanDataRef={oceanDataRef}
                sunPosition={globalSunPosition} 
                sunColor={globalSunColor} 
                fogColor={bottomColor}
                turbidity={turbidity}
                sunGlowSize={sunGlowSize}
                sunDiskSize={sunDiskSize}
                sunDiskIntensity={sunDiskIntensity}
                sunGlowIntensity={sunGlowIntensity}
                waterDeepColor={waterDeepColor}
                waterShallowColor={waterShallowColor}
            />
            <SeaFloorManager 
                waterDeepColor={waterDeepColor}
                waterShallowColor={waterShallowColor}
            />
        </>
    );
}