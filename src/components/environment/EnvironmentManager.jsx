import { useMemo } from 'react';
import * as THREE from 'three';
import { useControls, folder } from 'leva';
import { Environment } from '@react-three/drei';
import OceanManager from './ocean/OceanManager';
import SkyManager from './sky/SkyManager';

export default function EnvironmentManager() {

    //Global variables
    const { sunX, sunY, sunZ, sunColor } = useControls('Global Environment', {
        Sun: folder({
            sunX: { value: -200.0, min: -1000.0, max: 1000.0, step: 1.0 },
            sunY: { value: 150.0, min: -100.0, max: 1000.0, step: 1.0 },
            sunZ: { value: -500.0, min: -1000.0, max: 1000.0, step: 1.0 },
            sunColor: { value: '#ffdf70' }
        })
    }, {collapsed: true});

    const globalSunPosition = useMemo(() => new THREE.Vector3(sunX, sunY, sunZ), [sunX, sunY, sunZ]);
    const globalSunColor = useMemo(() => new THREE.Color(sunColor), [sunColor]);

    //Costruct the scene
    return (
        <>
            {/* Everything inside Environment background generate a cubemap taht three.js will apply
                FrameINfinity for dinamyc sky. can be bad for performance
            */}
            <Environment background resolution={256} frames={Infinity}>
                <SkyManager sunPosition={globalSunPosition} sunColor={globalSunColor}/>
            </Environment>
            <OceanManager sunPosition={globalSunPosition} sunColor={globalSunColor} />
        </>
    );
}