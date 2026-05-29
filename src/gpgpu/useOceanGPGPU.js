
import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import PingPong from './PingPong.js';
import ComputePass from './ComputePass.js';
import butterflyVertex from './shaders/butterfly/butterflyvertex.glsl';
import butterflyFragment from './shaders/butterfly/butterflyfragment.glsl';
import initialSpectrumVertex from '../gpgpu/shaders/initialSpectrum/initialspectrumvertex.glsl';
import initialSpectrumFragment from '../gpgpu/shaders/initialSpectrum/initialspectrumfragment.glsl';
import timeEvolutionVertex from './shaders/timeEvolution/timeevolutionvertex.glsl';
import timeEvolutionFragment from './shaders/timeEvolution/timeevolutionfragment.glsl';

export function useOceanGPGPU(resolution, patchSize){

    //WebGL Renderer
    const { gl } = useThree();

    //Phillips spectrum at time = 0. To be calculated 1 time
    const { h0Target } = useMemo(() => {
        const h0Target = new THREE.WebGLRenderTarget(
            resolution, 
            resolution, 
            {   //Same options as ping pong textures
                type: THREE.HalfFloatType, //To test also with FloatType
                minFilter: THREE.NearestFilter, //disable interpolation beetween pixels
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat,
                depthBuffer: false, //we don't need depth calculation
                stencilBuffer: false, //we don't need stencil calculation
                generateMipmaps: false 
            }
        );

        return { h0Target: h0Target };
    }, [resolution]);

    
    //Initialize pingPong textures and computePass renderer
    const { pingpong, computePass, butterflyMaterial, timeEvolutionMaterial } = useMemo(() => {
        const pingpong = new PingPong(resolution);
        
        //Main material for butterfly calculations
        const butterflyMaterial = new THREE.ShaderMaterial({
            vertexShader: butterflyVertex,
            fragmentShader: butterflyFragment
        });
        
        const computePass = new ComputePass(butterflyMaterial);

        const timeEvolutionMaterial = new THREE.ShaderMaterial({
            vertexShader: timeEvolutionVertex,
            fragmentShader: timeEvolutionFragment,
            uniforms: {
                uH0Target: { value: h0Target.texture },
                uTime: { value: 0 }
            }
        });
        
        return { pingpong, computePass, butterflyMaterial, timeEvolutionMaterial };
    }, [resolution]);


    //Create the initial spectrum creating the material and passing to computePass
    //UseEffect will be called AFTER React is reandering the component (useMemo WHILE is being rendered)
    useEffect(() => {
        
        const loopMaterial = computePass.material; //Safe initial material

        const initialSpectrumMaterial = new THREE.ShaderMaterial({
            vertexShader: initialSpectrumVertex, 
            fragmentShader: initialSpectrumFragment,
            uniforms: {
                uResolution: { value: resolution },
                uPatchSize: { value: patchSize },
                uAmplitude: { value: 20.0 },
                uWindSpeed: { value: 10.0 },
                uWindDirection: { value: new THREE.Vector2(-0.5, 1.0).normalize() }
            }
        });

        //Set and render the new material with the provided fragment to calculate the h0Spectrum
        computePass.setMaterial(initialSpectrumMaterial);

        computePass.render(gl, h0Target);

        computePass.setMaterial(loopMaterial); //Reset loopmaterial

        //Cleanup
        return () => {
            initialSpectrumMaterial.dispose();
        };
    }, [gl, computePass, h0Target]);

    //TICK function
    const updateGPGPU = (gl, time) => {

        timeEvolutionMaterial.uniforms.uTime.value = time;
        //Update the spectrum using the time rotation
        computePass.setMaterial(timeEvolutionMaterial);

        computePass.render(gl, pingpong.writeTarget);
        pingpong.swap();

        //BUTTERGLY LOGIC

        //Default renderer
        gl.setRenderTarget(null); 
    };

    return { 
        displacementTexture: pingpong.readTexture, 
        updateGPGPU 
    };

}