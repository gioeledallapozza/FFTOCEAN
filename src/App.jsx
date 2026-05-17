import { Canvas } from '@react-three/fiber'
import Experience from './components/Experience.jsx'

export default function App() {

  return (
    <>
      <Canvas className='webgl'
        camera = { 
          { 
            position: [ 0, 3, 8 ],
            fov: 45
          } 
        }
        drv = { [ 1, 2 ]}
        gl = { { antialias: false } }
      >
        <color attach="background" args={['#050505']} />
        <Experience />

      </Canvas>
    </>
  )
}
