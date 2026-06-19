import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import Experience from './components/Experience.jsx'
import * as THREE from 'three'

export default function App() {

  return (
    <>
      <Leva collapsed={true} />
      <Canvas className='webgl'
        camera = { { position: [ 0, 40, 200 ], fov: 45, far: 10000 } }
        dpr = { [ 1, 1.5 ] }
        gl = { 
          { 
            antialias: false,
            toneMapping: THREE.NoToneMapping, 
            toneMappingExposure: 2.0,
            outputColorSpace: THREE.LinearSRGBColorSpace
          }
        }
      >
        <Experience />

      </Canvas>
    </>
  )
}
