import { OrbitControls } from '@react-three/drei';
import { EffectComposer } from '@react-three/postprocessing'
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
                makeDefault 
                enablePan={true}
                enableZoom={true}
                minDistance={10}
                maxDistance={1000}
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
{/* 
       <mesh position={[0, 50, 0]}>
            <planeGeometry args={[50, 50]} />
            <shaderMaterial
                side={THREE.DoubleSide}
                uniforms={{ 
                    uDepth: { value: seafloorDepthTexture },
                    cameraNear: { value: camera.near },
                    cameraFar: { value: camera.far }
                }}
                vertexShader={`
                    varying vec2 vUv; 
                    void main() { 
                        vUv = uv; 
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
                    }
                `}
                fragmentShader={`
                    #include <packing>

                    uniform sampler2D uDepth; 
                    uniform float cameraNear;
                    uniform float cameraFar;
                    varying vec2 vUv; 

                    // Funzione esatta dell'esempio Three.js per linearizzare
                    float readDepth( sampler2D depthSampler, vec2 coord ) {
                        float fragCoordZ = texture2D( depthSampler, coord ).x;
                        float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
                        return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
                    }

                    void main() { 
                        // Ora d è un valore LINEARE tra 0.0 (vicino) e 1.0 (lontano)
                        float d = readDepth(uDepth, vUv); 
                        
                        // NOTA BENE SUL DEBUGGING:
                        // Siccome il tuo camera.far in App.jsx è 10000, e il piano è a -50 o -100 di distanza,
                        // 'd' sarà un numero minuscolo (es. 100/10000 = 0.01). Sarà quasi tutto NERO.
                        // Moltiplicalo o invertilo per poterlo vedere ad occhio nudo:
                        
                        float visibleDepth = d * 50.0; // Boost visivo solo per debug
                        
                        gl_FragColor = vec4(vec3(visibleDepth), 1.0); 
                    }
                `}
            />
        </mesh> */}

        {/* <gridHelper args={[1000, 100, '#444444', '#222222']} position={[0, -1, 0]} /> */}
    </>
}