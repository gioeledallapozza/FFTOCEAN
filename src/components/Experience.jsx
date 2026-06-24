import { OrbitControls } from '@react-three/drei';
import { EffectComposer } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber';
import { Perf } from 'r3f-perf';
import { useEffect, useRef } from 'react';
import { UnderwaterPostProcess } from '../postprocessing/UnderwaterPostProcess';
import { useSeaFloorDepth } from '../helpers/useSeaFloorDepth.js';
import EnvironmentManager from './environment/EnvironmentManager.jsx';


export default function Experience(){

    const controlsRef = useRef();
    const oceanDataRef = useRef({
        displacementY: null,
        patchSize: 250,
        scale: 1.0,
        waterDeepColor: '#15a5ec'
    });

    const seafloorDepthTexture = useSeaFloorDepth();

    const isDebug = window.location.hash === '#debug';

    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0); //Look in the distance -50,0,-100
            controlsRef.current.update();
        }
    }, []);

    //Block orbit controls
    useFrame(({ camera }) => {
        if (!controlsRef.current) return;

        if (camera.position.y < -49) {
            camera.position.y = -49;
        }
        
        if (controlsRef.current.target.y < -49) {
            controlsRef.current.target.y = -49;
        }

        if (camera.position.y > 200) {
            camera.position.y = 200;
        }
        if (controlsRef.current.target.y > 150) {
            controlsRef.current.target.y = 150;
        }
    });

    return <>
       {isDebug && <Perf position="top-left" />}
        <OrbitControls 
                ref={controlsRef}
                makeDefault 
                enablePan={true}
                enableZoom={true}
                minDistance={10}
                maxDistance={200}
            />
        
        <EnvironmentManager 
            depthTexture={seafloorDepthTexture} 
            oceanDataRef={oceanDataRef}
        />

        {/* POST PROCESSING */}
        {/* disableNormalPass is a mobile optimizaition */}
        <EffectComposer disableNormalPass depthBuffer={true} autoClear={false}>
            <UnderwaterPostProcess 
                oceanDataRef={oceanDataRef}
            />
        </EffectComposer>
    </>
}