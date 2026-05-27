import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import PingPong from '../gpgpu/PingPong.js';
import ComputePass from '../gpgpu/ComputePass.js';
import butterflyVertex from '../gpgpu/shaders/butterflyvertex.glsl';
import butterflyFragment from '../gpgpu/shaders/butterflyfragment.glsl';

//Old CPU ocean
import '../materials/OceanMaterial.js'
import { OceanEngine } from '../cpu_math/OceanEngine.js';

/* eslint-disable react-hooks/immutability */

export default function Ocean() {
    const materialRef = useRef();
    const resolution = 128;
    const patchSize = 1000.0;

    //GPGPU Setup
    const { pingPong, computePass } = useMemo(() => {
        //Create PingPong Buffers
        const pingPong = new PingPong(resolution);
        
        // Prepara il materiale con i tuoi shader di test
        const testMaterial = new THREE.ShaderMaterial({
            vertexShader: butterflyVertex,
            fragmentShader: butterflyFragment
        });
        
        const computePass = new ComputePass(testMaterial);
        
        return { pingPong, computePass };
    }, [resolution]);


    //OLD Ocean Engine
    // const oceanEngine = useMemo(() => {
    //     const angle = 45 * (Math.PI / 180);
    //     const windDir = { x: Math.cos(angle), y: Math.sin(angle) };
    //     return new OceanEngine(resolution, patchSize, 20.0, windDir, 0.05); 
    // }, []);

    // //Displacement Texture Setup
    // const displacementTexture = useMemo(() => {
    //     const emptyBuffer = new Float32Array(resolution * resolution);
    //     const texture = new THREE.DataTexture(
    //         emptyBuffer, 
    //         resolution, 
    //         resolution, 
    //         THREE.RedFormat, 
    //         THREE.FloatType
    //     );
    //     texture.wrapS = THREE.RepeatWrapping;
    //     texture.wrapT = THREE.RepeatWrapping;
    //     texture.minFilter = THREE.LinearFilter;
    //     texture.magFilter = THREE.LinearFilter;
    //     return texture;
    // }, []);

    //Geomtry Setup
    const oceanGeometry = useMemo(() => {
        const geometry = new THREE.PlaneGeometry(patchSize, patchSize, resolution, resolution);
        geometry.rotateX(-Math.PI / 2); //Rotate the plane once at the start to make it horizontal
        return geometry;
    }, []);

    //TICK
    useFrame((state) => 
    {
        // Tell to the renderer to render the computePass.scene and save it in writeTarget
        computePass.render(state.gl, pingPong.writeTarget);
        
        //Invert the buffers
        pingPong.swap();
        
        //Set render target to null (default frameBuffer)
        //The final render of the mesh will be outputted on the screeen
        state.gl.setRenderTarget(null);

        //OLD CPU OCEAN
        // const time = state.clock.getElapsedTime();

        // if (materialRef.current)
        //     materialRef.current.uTime = time;

        // const newHeights = oceanEngine.generateFrame(time);

  
        // displacementTexture.image.data.set(newHeights);
        // displacementTexture.needsUpdate = true;
    });


    return <>
        <mesh geometry={oceanGeometry}>
            {/* <oceanMaterial 
                ref = { materialRef } 
                uDisplacementMap = { displacementTexture }
                wireframe = { false }
            /> */}
            <meshBasicMaterial map={pingPong.readTexture} />
        </mesh>
    </>
}