
import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
//GPGPU utilities
import PingPong from './PingPong.js';
import ComputePass from './ComputePass.js';
import generateButterflyTexture from  './ButterflyTexture.js';
//Shaders
import butterflyVertex from './shaders/butterfly/butterflyvertex.glsl';
import butterflyFragment from './shaders/butterfly/butterflyfragment.glsl';
import initialSpectrumVertex from '../gpgpu/shaders/initialSpectrum/initialspectrumvertex.glsl';
import initialSpectrumFragment from '../gpgpu/shaders/initialSpectrum/initialspectrumfragment.glsl';
import timeEvolutionVertex from './shaders/timeEvolution/timeevolutionvertex.glsl';
import timeEvolutionFragment from './shaders/timeEvolution/timeevolutionfragment.glsl';

/* eslint-disable react-hooks/immutability */

export function useOceanGPGPU(resolution, patchSize, amplitude, windSpeed, windDirection){

    //WebGL Renderer
    const { gl } = useThree();

    //Phillips spectrum at time = 0. To be calculated 1 time
    const { h0Target } = useMemo(() => {
        const h0Target = new THREE.WebGLRenderTarget(
            resolution, 
            resolution, 
            {   //Same options as ping pong textures
                type: THREE.FloatType, //To test also with FloatType
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
    const { pingpongY, pingpongX, pingpongZ, computePass, butterflyMaterial, timeEvolutionMaterial } = useMemo(() => {
        const pingpongY = new PingPong(resolution);
        const pingpongX = new PingPong(resolution);
        const pingpongZ = new PingPong(resolution);

        const butterflyTexture = generateButterflyTexture(resolution); //Precalculate and map even/odd indices and twiddle factors.
        
        //Main material for butterfly calculations
        const butterflyMaterial = new THREE.ShaderMaterial({
            vertexShader: butterflyVertex,
            fragmentShader: butterflyFragment,
             uniforms: {
                uStage: { value: 0 },
                uStages: { value: Math.log2(resolution) },
                uDirection: { value: 0 },
                uPingPongTexture: { value: null },
                uButterflyTexture: { value: butterflyTexture }
            }
        });
        
        const computePass = new ComputePass(butterflyMaterial);

        const timeEvolutionMaterial = new THREE.ShaderMaterial({
            vertexShader: timeEvolutionVertex,
            fragmentShader: timeEvolutionFragment,
            uniforms: {
                uH0Target: { value: h0Target.texture },
                uResolution: { value: resolution },
                uTime: { value: 0 },
                uPatchSize: { value: patchSize },
                uOutputMode: { value: 0 } // 0 = Height (Y), 1 = Choppy (X), 2 = Choppy (Z)
            }
        });
        
        return { pingpongY, pingpongX, pingpongZ, computePass, butterflyMaterial, timeEvolutionMaterial };
    }, [resolution, h0Target, patchSize]);


    //Create the initial spectrum creating the material and passing to computePass
    //UseEffect will be called AFTER React rendered the component (useMemo WHILE is being rendered)
    useEffect(() => {
        
        const loopMaterial = computePass.material; //Safe initial material

        const initialSpectrumMaterial = new THREE.ShaderMaterial({
            vertexShader: initialSpectrumVertex, 
            fragmentShader: initialSpectrumFragment,
            uniforms: {
                uResolution: { value: resolution },
                uPatchSize: { value: patchSize },
                uAmplitude: { value: amplitude },
                uWindSpeed: { value: windSpeed },
                uWindDirection: { value: windDirection }
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
    }, [gl, computePass, h0Target, resolution, patchSize, amplitude, windSpeed, windDirection]);

    //GARBAGE COLLECTOR
    useEffect(() => {
        return () => {
            h0Target.dispose();

            //Utility function to dispose ping pong textures and FBOs
            const disposePingPong = (pp) => {
                if (pp.readTarget) pp.readTarget.dispose();
                if (pp.writeTarget) pp.writeTarget.dispose();
                if (pp.fbo1) pp.fbo1.dispose(); 
                if (pp.fbo2) pp.fbo2.dispose(); 
            };

            disposePingPong(pingpongY);
            disposePingPong(pingpongX);
            disposePingPong(pingpongZ);

            if (butterflyMaterial.uniforms.uButterflyTexture.value) {
                butterflyMaterial.uniforms.uButterflyTexture.value.dispose();
            }
            computePass.material.dispose();
            timeEvolutionMaterial.dispose();
            butterflyMaterial.dispose();
        };
    }, [h0Target, pingpongY, pingpongX, pingpongZ, butterflyMaterial, timeEvolutionMaterial, computePass]);

    //TICK function
    const updateGPGPU = (gl, time) => {

        timeEvolutionMaterial.uniforms.uTime.value = time;
        //Update the spectrum using the time rotation
        computePass.setMaterial(timeEvolutionMaterial);

        //Time evolution for each component of the spectrum. 
        //We need 6 total outputs channels so we need more than 1 texture
        // Y (Height)
        timeEvolutionMaterial.uniforms.uOutputMode.value = 0;
        computePass.render(gl, pingpongY.writeTarget);
        pingpongY.swap();

        // X (Choppiness)
        timeEvolutionMaterial.uniforms.uOutputMode.value = 1;
        computePass.render(gl, pingpongX.writeTarget);
        pingpongX.swap();

        // Z (Choppiness)
        timeEvolutionMaterial.uniforms.uOutputMode.value = 2;
        computePass.render(gl, pingpongZ.writeTarget);
        pingpongZ.swap();

        //BUTTERFLY LOGIC
        computePass.setMaterial(butterflyMaterial);

        const iterations = Math.log2(resolution); //Log2 because we divide the texture in half at each stage

        // Horizontal Passes
        butterflyMaterial.uniforms.uDirection.value = 0;
        for(let i = 0; i < iterations; i++) {
            butterflyMaterial.uniforms.uStage.value = i;


            // Y
            butterflyMaterial.uniforms.uPingPongTexture.value = pingpongY.readTexture;
            computePass.render(gl, pingpongY.writeTarget);
            pingpongY.swap();

            // X
            butterflyMaterial.uniforms.uPingPongTexture.value = pingpongX.readTexture;
            computePass.render(gl, pingpongX.writeTarget);
            pingpongX.swap();

            // Z
            butterflyMaterial.uniforms.uPingPongTexture.value = pingpongZ.readTexture;
            computePass.render(gl, pingpongZ.writeTarget);
            pingpongZ.swap();
        }

        // Vertical Passes
        butterflyMaterial.uniforms.uDirection.value = 1;
        for(let i = 0; i < iterations; i++) {
            butterflyMaterial.uniforms.uStage.value = i;

            // Y
            butterflyMaterial.uniforms.uPingPongTexture.value = pingpongY.readTexture;
            computePass.render(gl, pingpongY.writeTarget);
            pingpongY.swap();

            // X
            butterflyMaterial.uniforms.uPingPongTexture.value = pingpongX.readTexture;
            computePass.render(gl, pingpongX.writeTarget);
            pingpongX.swap();

            // Z
            butterflyMaterial.uniforms.uPingPongTexture.value = pingpongZ.readTexture;
            computePass.render(gl, pingpongZ.writeTarget);
            pingpongZ.swap();
        }

        //Default renderer
        gl.setRenderTarget(null); 

        return {
            displacementY: pingpongY.readTexture,
            displacementX: pingpongX.readTexture,
            displacementZ: pingpongZ.readTexture
        };
    };

    return { 
        updateGPGPU 
    };

}