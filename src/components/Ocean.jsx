import { useFrame } from '@react-three/fiber'
import '../materials/OceanMaterial.js'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function Ocean() {
    const materialRef = useRef()

    useFrame((state) => 
    {
        if (materialRef.current)
            materialRef.current.uTime = state.clock.getElapsedTime()
    })

    const oceanGeometry = useMemo(() => {

        const geometry = new THREE.PlaneGeometry(10, 10, 128, 128)
        geometry.rotateX(-Math.PI / 2)
    
        return geometry
    }, [])

    return <>
        <mesh geometry={oceanGeometry}>
            <oceanMaterial ref = { materialRef } wireframe />
        </mesh>
    </>
}