import { useMemo } from 'react';
import * as THREE from 'three';
import { useControls, folder } from 'leva';
import { Environment } from '@react-three/drei';
import OceanManager from './ocean/OceanManager';
import SkyManager from './sky/SkyManager';

export default function EnvironmentManager() {

    //Global variables
    const { sunDistance, sunTheta, sunPhi, sunColor, topColor, bottomColor, turbidity, sunGlowSize } = useControls('Global Environment', {
        Sun: folder({
            sunDistance: { value: 500.0, min: 100.0, max: 2000.0, step: 10.0 },
            sunTheta: { value: 1.44, min: 0, max: Math.PI, step: 0.01 }, 
            sunPhi: { value: 4.57, min: 0, max: Math.PI * 2, step: 0.01 },
            sunColor: { value: '#ffdf70' },
            turbidity: { value: 6.0, min: 0.1, max: 20, step: 0.1 },
            sunGlowSize: { value: 0.999, min: 0.900, max: 0.9999, step: 0.0001 },
        }),
        Sky: folder({
            topColor: { value: '#064289' },
            bottomColor: { value: '#79b8d9' }
        })
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
            <Environment background resolution={256} frames={Infinity}>
                <SkyManager 
                    sunPosition={globalSunPosition} 
                    sunColor={globalSunColor}
                    topColor={topColor}
                    bottomColor={bottomColor}
                    turbidity={turbidity}
                    sunGlowSize={sunGlowSize}
                />
            </Environment>
            {/* <SkyManager 
                sunPosition={globalSunPosition} 
                sunColor={globalSunColor}
                topColor={topColor}
                bottomColor={bottomColor}
            /> */}
            <OceanManager 
                sunPosition={globalSunPosition} 
                sunColor={globalSunColor} 
                fogColor={bottomColor}
                turbidity={turbidity}
                sunGlowSize={sunGlowSize}
            />
        </>
    );
}