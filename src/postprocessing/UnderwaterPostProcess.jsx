import { forwardRef, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { UnderwaterEffect } from './UnderwaterEffect'

export const UnderwaterPostProcess = forwardRef(({ oceanDataRef, waterDensity }, ref) => {
    const { camera } = useThree()
  
    const effect = useMemo(() => new UnderwaterEffect({ 
        oceanDataRef, 
        camera,
        waterDensity
    }), [oceanDataRef, camera, waterDensity])

    return <primitive ref={ref} object={effect} dispose={null} />
})