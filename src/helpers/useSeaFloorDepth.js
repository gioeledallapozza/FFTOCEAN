import { useMemo, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* eslint-disable react-hooks/immutability */
export function useSeaFloorDepth() {
    const { gl, scene, camera, size } = useThree()

    //Refs for camera 
    const lastCameraPos = useRef(new THREE.Vector3())
    const lastCameraRot = useRef(new THREE.Euler())

    const needsUpdate = useRef(true)

    const depthTarget = useMemo(() => {
        const dpr = gl.getPixelRatio()
        const downscale = 2
        const physicalWidth = Math.ceil(size.width * dpr / downscale)
        const physicalHeight = Math.ceil(size.height * dpr / downscale)

        const target = new THREE.WebGLRenderTarget(physicalWidth, physicalHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
        })
        
        target.depthTexture = new THREE.DepthTexture()
        target.depthTexture.type = THREE.UnsignedIntType
        
        return target
    }, [size.width, size.height, gl])

    useEffect(() => {
        //When the target is created update it
        needsUpdate.current = true;
    }, [depthTarget])

    useEffect(() => {
        return () => depthTarget.dispose()
    }, [depthTarget])

    useFrame(() => {
        const width = gl.domElement.width;
        const height = gl.domElement.height;

        if (depthTarget.width !== width || depthTarget.height !== height) {
            depthTarget.setSize(width, height);
            needsUpdate.current = true;
        }

        //OPTIMIZATION ONLY WHEN CAMERA MOVES CALCULATE DEPTH MATERIAL
        const distanceSq = lastCameraPos.current.distanceToSquared(camera.position);
        
        //difference in rotation
        const rotDiff = Math.abs(lastCameraRot.current.x - camera.rotation.x) + 
                        Math.abs(lastCameraRot.current.y - camera.rotation.y) + 
                        Math.abs(lastCameraRot.current.z - camera.rotation.z);

        if (distanceSq > 0.0001 || rotDiff > 0.0001) {
            needsUpdate.current = true;
            
            //Update memory
            lastCameraPos.current.copy(camera.position);
            lastCameraRot.current.copy(camera.rotation);
        }

        //If we do not need to update exit
        if (!needsUpdate.current) return;

        //DEPTH BUFFER RENDER
        const originalRenderTarget = gl.getRenderTarget()
        const originalBackground = scene.background
        const originalAutoClear = gl.autoClear

        gl.setRenderTarget(depthTarget)
        gl.autoClear = false
        gl.clear(true, true, false)
        scene.background = null

        // render only layer 1
        camera.layers.set(1)
        gl.render(scene, camera)

        // Reset to deafult values
        camera.layers.enableAll() 
        scene.background = originalBackground
        gl.setRenderTarget(originalRenderTarget)
        gl.autoClear = originalAutoClear

        needsUpdate.current = false;

    }, -1) 
        
    return depthTarget.depthTexture
}