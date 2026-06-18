import { OrbitControls } from '@react-three/drei';
import { Perf } from 'r3f-perf';

import EnvironmentManager from './environment/EnvironmentManager.jsx';
import { useEffect, useRef } from 'react';

export default function Experience(){

    const controlsRef = useRef();

    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0); //Look in the distance -50,0,-100
            controlsRef.current.update();
        }
    }, []);

    return <>
        <Perf position="top-left" />
        <OrbitControls 
                ref={controlsRef}
                makeDefault // Importante affinché drei lo riconosca come camera principale
                enablePan={true}
                enableZoom={true}
                minDistance={10}
                maxDistance={2000}
            />

        <EnvironmentManager />

        {/* <gridHelper args={[1000, 100, '#444444', '#222222']} position={[0, -1, 0]} /> */}
    </>
}