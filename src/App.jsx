import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import Experience from './components/Experience.jsx'
import * as THREE from 'three'

export default function App() {

  const isDebug = window.location.hash === '#debug';

  return (
    <>
      <Leva collapsed={true} hidden={!isDebug} />
      <Canvas className='webgl'
        camera = { { position: [ 0, 40, 200 ], fov: 45, far: 4000 } }
        dpr = { 1 } //Pixel ratio
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
