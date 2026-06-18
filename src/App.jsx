import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import Experience from './components/Experience.jsx'

export default function App() {

  return (
    <>
      <Leva collapsed={true} />
      <Canvas className='webgl'
        camera = { { position: [ 0, 40, 200 ], fov: 45, far: 10000 } }
        dpr = { [ 1, 1.5 ] }
        gl = { { antialias: false } }
      >
        <Experience />

      </Canvas>
    </>
  )
}
