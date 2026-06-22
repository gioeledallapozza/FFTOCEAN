import { useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* eslint-disable react-hooks/immutability */
export function useSeaFloorDepth() {
    const { gl, scene, camera, size } = useThree()

    const depthTarget = useMemo(() => {
        const dpr = gl.getPixelRatio()
        const physicalWidth = size.width * dpr
        const physicalHeight = size.height * dpr

        const target = new THREE.WebGLRenderTarget(physicalWidth, physicalHeight, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            depthBuffer: true,
        })
        
        target.depthTexture = new THREE.DepthTexture()
        target.depthTexture.type = THREE.UnsignedIntType
        
        return target
    }, [size.width, size.height, gl])

    useEffect(() => {
        return () => depthTarget.dispose()
    }, [depthTarget])

    useFrame(() => {
        const width = gl.domElement.width;
        const height = gl.domElement.height;

        if (depthTarget.width !== width || depthTarget.height !== height) {
            depthTarget.setSize(width, height);
        }

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

    }, -1) 
        
    return depthTarget.depthTexture
}